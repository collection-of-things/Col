import { build } from "esbuild";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { authenticateRuntimeFile, restoreArchive, resolveNpmCli } from "./preview-package-archive.mjs";

const hash = bytes => createHash("sha256").update(bytes).digest("hex");

/** Verify a pinned upstream notice when an authenticated npm archive omits one. */
export function verifySolidLicenseFallback(packageName, version, declaredLicense, fallback) {
  if (!fallback) throw new Error(`Missing license notice for ${packageName}@${version}`);
  if (typeof declaredLicense !== "string" || !declaredLicense || fallback.license !== declaredLicense) throw new Error(`License declaration mismatch for ${packageName}@${version}`);
  if (!/^https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[a-f\d]{40}\//.test(fallback.url)) throw new Error(`Invalid license source for ${packageName}@${version}`);
  if (typeof fallback.text !== "string" || !fallback.text.trim() || typeof fallback.integrity !== "string" || hash(fallback.text) !== fallback.integrity.replace(/^sha256:/, "")) throw new Error(`License integrity mismatch for ${packageName}@${version}`);
  return { package: packageName, version, url: fallback.url, text: fallback.text };
}

/** Compile a reviewed mount entry against its isolated, locked Solid graph.
 * Source/demo extraction and upstream theme compilation stay with each library. */
export async function buildSolidPreview({ entry, resolveDir, sourceRoot = dirname(entry), runtime = "solid1", compiler = "babel", aliases = {}, css = "", licenseFallbacks = {}, unusedImports = [] }) {
  resolveDir = resolve(resolveDir);
  sourceRoot = resolve(sourceRoot);
  const require = createRequire(resolve(resolveDir, "package.json"));
  const lock = JSON.parse(await readFile(resolve(resolveDir, "package-lock.json"), "utf8"));
  const babel = compiler === "babel" ? require("@babel/core") : undefined;
  const preset = babel ? require.resolve("babel-preset-solid") : undefined;
  const typescript = babel ? require.resolve("@babel/preset-typescript") : undefined;
  const solidCompiler = compiler === "solid2" ? await import(pathToFileURL(require.resolve("@solidjs/compiler")).href) : undefined;
  if (!babel && !solidCompiler) throw new Error(`Unsupported Solid compiler: ${compiler}`);
  if (!["solid1", "solid2"].includes(runtime)) throw new Error(`Unsupported Solid version family: ${runtime}`);

  const result = await build({
    absWorkingDir: resolveDir, entryPoints: [resolve(entry)], outdir: resolve(resolveDir, "output"),
    bundle: true, write: false, format: "esm", platform: "browser", target: "es2022",
    conditions: ["browser"], mainFields: ["browser", "module", "main"],
    minify: true, legalComments: "inline", metafile: true,
    define: { "process.env.NODE_ENV": '"production"', "import.meta.env.DEV": "false", "import.meta.env.PROD": "true" },
    loader: { ".module.css": "local-css", ".woff2": "dataurl", ".woff": "dataurl", ".ttf": "dataurl", ".svg": "dataurl", ".png": "dataurl", ".webp": "dataurl" },
    plugins: [{ name: "verified-solid", setup(builder) {
      builder.onResolve({ filter: /.*/ }, async args => {
        if (args.pluginData?.colResolve) return;
        // A docs module may import dependencies used only by unselected demos.
        if (unusedImports.includes(args.path)) return { path: args.path, external: true, sideEffects: false };
        const alias = Object.keys(aliases).sort((a, b) => b.length - a.length).find(key => args.path === key.replace(/\/$/, "") || args.path.startsWith(key.endsWith("/") ? key : key + "/"));
        if (alias) {
          const suffix = args.path.slice(alias.replace(/\/$/, "").length).replace(/^\//, "");
          const found = await builder.resolve(resolve(aliases[alias], suffix), { kind: args.kind, resolveDir, pluginData: { colResolve: true } });
          return { path: found.path, errors: found.errors, warnings: found.warnings };
        }
        if (/^(?:[./]|[A-Za-z]:[\\/])/.test(args.path)) return;
        if (/^(?:node:|https?:)/.test(args.path)) throw new Error(`External runtime dependency is not allowed: ${args.path}`);
        // Source snapshots live outside the build directory; they must not pick up Col's Solid 2 installation.
        const local = relative(resolveDir, args.resolveDir).replaceAll("\\", "/");
        const from = local === "node_modules" || local.startsWith("node_modules/") ? args.resolveDir : resolveDir;
        const found = await builder.resolve(args.path, { kind: args.kind, resolveDir: from, pluginData: { colResolve: true } });
        return { path: found.path, errors: found.errors, warnings: found.warnings };
      });
      builder.onLoad({ filter: /\.[jt]sx$/ }, async ({ path }) => {
        const source = await readFile(path, "utf8");
        if (babel) {
          const transformed = await babel.transformAsync(source, {
            filename: path, babelrc: false, configFile: false,
            presets: [[preset, { generate: "dom", hydratable: false, moduleName: runtime === "solid1" ? "solid-js/web" : "@solidjs/web" }], [typescript, { allExtensions: true, isTSX: true }]],
          });
          if (!transformed?.code) throw new Error(`Solid compilation produced no code: ${path}`);
          return { contents: transformed.code, loader: "js", resolveDir: dirname(path) };
        }
        const transformed = solidCompiler.transform(source, { filename: path, generate: "dom", moduleName: "@solidjs/web", hydratable: false });
        if (transformed.errors?.length) throw new Error(`${path}: ${JSON.stringify(transformed.errors)}`);
        return { contents: transformed.code, loader: "ts", resolveDir: dirname(path) };
      });
    } }],
  });
  if (Object.values(result.metafile.outputs).some(output => output.imports.some(item => item.external))) throw new Error("Solid previews must bundle every runtime dependency");

  const packages = new Map();
  const inputs = [];
  const isSnapshot = absolute => {
    const path = relative(sourceRoot, absolute).replaceAll("\\", "/");
    return path !== ".." && !path.startsWith("../") && !isAbsolute(path) && !path.split("/").includes("node_modules");
  };
  for (const input of Object.keys(result.metafile.inputs)) {
    const absolute = resolve(resolveDir, input);
    const path = relative(resolveDir, absolute).replaceAll("\\", "/");
    const bytes = await readFile(absolute);
    inputs.push({ path: relative(sourceRoot, absolute).replaceAll("\\", "/"), sha256: hash(bytes) });
    if (isSnapshot(absolute)) continue;
    if (!path.startsWith("node_modules/")) throw new Error(`Solid preview input is outside its source and locked dependencies: ${path}`);
    let owner = dirname(path).replaceAll("\\", "/");
    while (!lock.packages[owner] && owner !== ".") owner = dirname(owner).replaceAll("\\", "/");
    if (!lock.packages[owner]) throw new Error(`No locked package owns ${path}`);
    packages.set(owner, lock.packages[owner]);
  }

  const cache = resolve(resolveDir, "node_modules/.cache/col-archives");
  await mkdir(cache, { recursive: true });
  const { Parser } = createRequire(resolveNpmCli())("tar");
  const expectedHashes = new Map();
  const notices = [];
  for (const [path, pkg] of packages) {
    if (!pkg.resolved?.startsWith("https://registry.npmjs.org/") || !pkg.integrity) throw new Error(`Missing npm integrity for ${path}`);
    const cached = resolve(cache, hash(pkg.integrity) + ".tgz");
    let bytes = await readFile(cached).catch(error => { if (error.code !== "ENOENT") throw error; });
    if (!bytes) {
      const response = await fetch(pkg.resolved, { signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`Cannot authenticate ${path}: ${response.status}`);
      bytes = Buffer.from(await response.arrayBuffer());
    }
    restoreArchive({ bytes, integrity: pkg.integrity, installRoot: resolveDir, packagePath: path, Parser, allowFile: () => true, verifiedFiles: new Set(), expectedHashes, restoreFile: () => false });
    await writeFile(cached, bytes);
    const licensePaths = [...expectedHashes.keys()].filter(file => file.startsWith(path + "/") && /^licen[cs]e(?:[._-][^/]*)?$/i.test(relative(path, file)));
    if (!licensePaths.length) {
      const packagePath = `${path}/package.json`;
      const packageBytes = await readFile(resolve(resolveDir, packagePath));
      authenticateRuntimeFile(packageBytes, packagePath, expectedHashes);
      const metadata = JSON.parse(packageBytes);
      if (metadata.name !== path.slice(path.lastIndexOf("node_modules/") + "node_modules/".length) || metadata.version !== pkg.version) throw new Error(`Package identity mismatch for ${path}`);
      const readmePath = [...expectedHashes.keys()].find(file => file.startsWith(path + "/") && /^readme(?:\.[^/]*)?$/i.test(relative(path, file)));
      let notice;
      if (readmePath && metadata.license === "MIT") {
        const readmeBytes = await readFile(resolve(resolveDir, readmePath));
        authenticateRuntimeFile(readmeBytes, readmePath, expectedHashes);
        const readme = readmeBytes.toString("utf8");
        const start = readme.indexOf("MIT License");
        if (start >= 0 && readme.includes("Permission is hereby granted", start) && readme.includes("THE SOFTWARE IS PROVIDED", start)) notice = { package: metadata.name, version: pkg.version, url: pkg.resolved, text: readme.slice(start) };
      }
      notices.push(notice ?? verifySolidLicenseFallback(metadata.name, pkg.version, metadata.license, licenseFallbacks[`${metadata.name}@${pkg.version}`]));
    }
    for (const license of licensePaths) {
      const content = await readFile(resolve(resolveDir, license));
      authenticateRuntimeFile(content, license, expectedHashes);
      notices.push({ package: path.slice(path.lastIndexOf("node_modules/") + "node_modules/".length), version: pkg.version, url: pkg.resolved, text: content.toString("utf8") });
    }
  }
  for (const input of Object.keys(result.metafile.inputs)) {
    const path = relative(resolveDir, resolve(resolveDir, input)).replaceAll("\\", "/");
    if (!isSnapshot(resolve(resolveDir, input)) && path.startsWith("node_modules/")) authenticateRuntimeFile(await readFile(resolve(resolveDir, path)), path, expectedHashes);
  }
  const banner = "/*!\n" + notices.map(notice => `${notice.package}@${notice.version}\n${notice.text}`).join("\n\n").replaceAll("*/", "* /") + "\n*/\n";
  const code = banner + result.outputFiles.find(file => file.path.endsWith(".js")).text;
  return {
    code, css: [css, ...result.outputFiles.filter(file => file.path.endsWith(".css")).map(file => file.text)].filter(Boolean).join("\n"),
    integrity: hash(code), inputs, notices,
    packages: Object.fromEntries(packages), lockIntegrity: hash(await readFile(resolve(resolveDir, "package-lock.json"))),
  };
}
