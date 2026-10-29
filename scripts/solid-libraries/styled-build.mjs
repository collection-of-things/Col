import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile, copyFile, access } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSolidPreview } from "../solid-preview-build.mjs";
import { authenticateRuntimeFile, restoreArchive, resolveNpmCli } from "../preview-package-archive.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const posix = path => path.replaceAll("\\", "/");

async function authenticateTailwindCss(resolveDir) {
  const lock = JSON.parse(await readFile(resolve(resolveDir, "package-lock.json"), "utf8"));
  const packagePath = "node_modules/tailwindcss";
  const pkg = lock.packages[packagePath];
  if (!pkg?.integrity || !pkg.resolved?.startsWith("https://registry.npmjs.org/")) throw new Error("Tailwind CSS needs an authenticated npm archive");
  const cache = resolve(resolveDir, "node_modules/.cache/col-archives");
  await mkdir(cache, { recursive: true });
  const archive = resolve(cache, hash(pkg.integrity) + ".tgz");
  let bytes = await readFile(archive).catch(error => { if (error.code !== "ENOENT") throw error; });
  if (!bytes) {
    const response = await fetch(pkg.resolved, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Cannot authenticate Tailwind CSS: ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  const { Parser } = createRequire(resolveNpmCli())("tar");
  const expectedHashes = new Map();
  restoreArchive({ bytes, integrity: pkg.integrity, installRoot: resolveDir, packagePath, Parser, allowFile: () => true, verifiedFiles: new Set(), expectedHashes, restoreFile: () => false });
  await writeFile(archive, bytes);
  const inputs = [];
  const notices = [];
  for (const path of expectedHashes.keys()) {
    const license = /\/licen[cs]e(?:\.[^/]*)?$/i.test(path);
    if (!path.endsWith(".css") && !license) continue;
    const content = await readFile(resolve(resolveDir, path));
    authenticateRuntimeFile(content, path, expectedHashes);
    inputs.push({ path, sha256: hash(content) });
    if (license) notices.push({ url: pkg.resolved, text: content.toString("utf8") });
  }
  if (!inputs.some(input => input.path.endsWith("/index.css")) || !notices.length) throw new Error("Tailwind CSS source or license is missing");
  return { inputs, notices };
}

/** Rebuild styled Solid examples without borrowing Col's framework or theme. */
export async function buildStyledLibrary(slug, styleImports) {
  const sourceRoot = resolve(root, "data/solid-libraries", slug);
  const sourceFile = path => {
    const file = resolve(sourceRoot, path);
    const child = relative(sourceRoot, file);
    if (isAbsolute(path) || /^[A-Za-z]:[\\/]/.test(path) || child === ".." || child.startsWith("../") || child.startsWith("..\\") || isAbsolute(child)) throw new Error(`Source path escapes its library: ${path}`);
    return file;
  };
  const config = JSON.parse(await readFile(resolve(sourceRoot, "provenance.json"), "utf8"));
  for (const source of config.sources) {
    if (hash(await readFile(sourceFile(source.path))) !== source.integrity) throw new Error(`Changed upstream input: ${source.path}`);
  }
  const resolveDir = resolve(process.argv[2] ?? resolve(root, "node_modules/.cache/solid-previews", slug));
  await mkdir(resolveDir, { recursive: true });
  const requestedLock = await readFile(resolve(sourceRoot, "package-lock.json"));
  const existingLock = await readFile(resolve(resolveDir, "package-lock.json")).catch(error => { if (error.code !== "ENOENT") throw error; });
  for (const file of ["package.json", "package-lock.json"]) await copyFile(resolve(sourceRoot, file), resolve(resolveDir, file));
  const installed = await access(resolve(resolveDir, "node_modules/@tailwindcss/cli/package.json")).then(() => true, () => false);
  if (!installed || !existingLock || hash(existingLock) !== hash(requestedLock)) execFileSync(process.execPath, [resolveNpmCli(), "ci", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: resolveDir, stdio: "inherit" });

  const require = createRequire(resolve(resolveDir, "package.json"));
  const tailwind = await authenticateTailwindCss(resolveDir);
  const cssEntry = resolve(resolveDir, "preview.css");
  const cssOutput = resolve(resolveDir, "preview.compiled.css");
  const imports = [require.resolve("tailwindcss/index.css"), ...styleImports.map(sourceFile)];
  const styleInputs = [...tailwind.inputs, ...await Promise.all(styleImports.map(async path => ({ path, sha256: hash(await readFile(sourceFile(path))) })))];
  await writeFile(cssEntry, imports.map((path, index) => `@import ${JSON.stringify(posix(path))}${index === 0 ? " source(none)" : ""};`).join("\n") + `\n@source ${JSON.stringify(posix(resolve(sourceRoot, "upstream")))};\n@source ${JSON.stringify(posix(resolve(sourceRoot, "examples")))};\n`);
  const cli = resolve(dirname(require.resolve("@tailwindcss/cli/package.json")), "dist/index.mjs");
  execFileSync(process.execPath, [cli, "-i", cssEntry, "-o", cssOutput, "--minify"], { cwd: resolveDir, stdio: "inherit" });
  let css = await readFile(cssOutput, "utf8");
  for (const asset of config.assets ?? []) {
    const bytes = await readFile(sourceFile(asset.path));
    if (hash(bytes) !== asset.integrity) throw new Error(`Changed upstream asset: ${asset.path}`);
    css = css.replaceAll(asset.url, `data:${asset.mimeType};base64,${bytes.toString("base64")}`);
    styleInputs.push({ path: asset.path, sha256: asset.integrity });
  }
  const aliases = Object.fromEntries(Object.entries(JSON.parse(await readFile(resolve(sourceRoot, "aliases.json"), "utf8"))).map(([key, path]) => [key, sourceFile(path)]));
  const sourceNotices = [...tailwind.notices, ...await Promise.all(config.sources.filter(source => /(?:LICENSE|NOTICE|THIRD_PARTY_NOTICES)/.test(source.path)).map(async source => ({ url: source.url, text: await readFile(sourceFile(source.path), "utf8") })))];
  if (!sourceNotices.length) throw new Error(`Missing upstream license for ${slug}`);
  const banner = "/*!\n" + sourceNotices.map(notice => notice.text).join("\n\n").replaceAll("*/", "* /") + "\n*/\n";
  const entries = {};
  const notices = new Map(sourceNotices.map(notice => [notice.url, notice]));
  const graphs = {};
  for (const name of config.components) {
    const result = await buildSolidPreview({ entry: sourceFile(`examples/${name}.tsx`), resolveDir, sourceRoot, runtime: config.runtime, aliases, css });
    const code = banner + result.code;
    const upstream = config.sources.find(source => source.path === config.componentSources[name]);
    if (!upstream) throw new Error(`Missing component source: ${slug}/${name}`);
    entries[`${slug}/${name}`] = { code, css: result.css, package: config.package, version: config.version, runtimeVersion: config.runtimeVersion, exportName: config.exports?.[name] ?? name, source: { url: upstream.url, revision: config.rev, integrity: upstream.integrity }, gaps: config.gaps?.[name] ?? [] };
    for (const notice of result.notices) notices.set(notice.url, { url: notice.url, text: notice.text });
    graphs[name] = { codeIntegrity: hash(code), cssIntegrity: hash(result.css), lockIntegrity: result.lockIntegrity, styleInputs, inputs: result.inputs, packages: result.packages };
  }
  await writeFile(resolve(sourceRoot, "build-manifest.json"), JSON.stringify(graphs, null, 2) + "\n");
  const target = resolve(root, "data/component-previews/solid", `${slug}.json`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, JSON.stringify({ entries, sources: [...config.sources.map(({ url, integrity }) => ({ url, integrity })), ...(config.evidenceSources ?? [])], notices: [...notices.values()] }) + "\n");
  console.log(`${slug}: ${Object.keys(entries).length} authenticated previews`);
}
