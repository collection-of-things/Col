import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, constants } from "node:zlib";
import { buildSolidPreview } from "../solid-preview-build.mjs";
import { authenticateRuntimeFile, restoreArchive, resolveNpmCli } from "../preview-package-archive.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const sha256 = value => createHash("sha256").update(value).digest("hex");

/** Restore authenticated, readable source inputs. npm ci uses the retained lock. */
export async function openSourceBuild(slug) {
  const dataDir = resolve(root, "data/solid-libraries", slug);
  const resolveDir = resolve(root, ".scratch/solid-library-69/solid-motion/build", slug);
  const sourceRoot = resolve(resolveDir, "source");
  const upstream = JSON.parse(await readFile(resolve(dataDir, "upstream.json"), "utf8"));
  await mkdir(sourceRoot, { recursive: true });
  // Upstream documentation themes may be npm source snapshots, not runtime imports.
  for (const [name, pkg] of Object.entries(upstream.cssPackages ?? {})) {
    const response = await fetch(pkg.resolved, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Cannot authenticate theme source ${name}`);
    const { Parser } = createRequire(resolveNpmCli())("tar");
    const expectedHashes = new Map();
    restoreArchive({ bytes: Buffer.from(await response.arrayBuffer()), integrity: pkg.integrity, installRoot: resolveDir, packagePath: `node_modules/${name}`, Parser, allowFile: () => true, verifiedFiles: new Set(), expectedHashes, restoreFile: () => false });
    for (const [path, file] of Object.entries(upstream.files)) if (path.startsWith(pkg.sourcePrefix)) authenticateRuntimeFile(Buffer.from(file.content), `node_modules/${name}/${path.slice(pkg.sourcePrefix.length)}`, expectedHashes);
  }
  for (const [path, file] of Object.entries(upstream.files)) {
    if (sha256(file.content) !== file.integrity) throw new Error(`Source integrity mismatch: ${slug}/${path}`);
    const target = resolve(sourceRoot, path);
    if (!target.startsWith(sourceRoot + "/") && !target.startsWith(sourceRoot + "\\")) throw new Error(`Unsafe source path: ${path}`);
    await mkdir(dirname(target), { recursive: true });
    // The original image bytes are retained; only transport changes for the sandbox CSP.
    let content = file.content;
    for (const [url, asset] of Object.entries(upstream.assets)) {
      const bytes = Buffer.from(asset.dataUrl.split(",")[1], "base64");
      if (sha256(bytes) !== asset.integrity) throw new Error(`Asset integrity mismatch: ${url}`);
      const mediaType = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "image/png" : bytes.subarray(0, 4).toString() === "wOF2" ? "font/woff2" : bytes.subarray(0, 500).includes("<svg") ? "image/svg+xml" : undefined;
      if (!mediaType || !asset.dataUrl.startsWith(`data:${mediaType};base64,`)) throw new Error(`Asset media type mismatch: ${url}`);
      content = content.replaceAll(url, asset.dataUrl);
    }
    await writeFile(target, content);
  }
  const packageJson = await readFile(resolve(dataDir, "package.json"));
  const packageLock = await readFile(resolve(dataDir, "package-lock.json"));
  await writeFile(resolve(resolveDir, "package.json"), packageJson);
  await writeFile(resolve(resolveDir, "package-lock.json"), packageLock);
  // A clean, lock-verified install authenticates CSS tools too, not just bundled JS.
  const install = spawnSync(process.execPath, [resolveNpmCli(), "ci", "--ignore-scripts", "--no-audit", "--no-fund", "--prefer-offline"], { cwd: resolveDir, stdio: "inherit", windowsHide: true });
  if (install.error || install.status !== 0) throw new Error(`Locked install failed for ${slug}: ${install.error?.message ?? install.status}`);
  return { slug, dataDir, resolveDir, sourceRoot, upstream, require: createRequire(resolve(resolveDir, "package.json")), lock: JSON.parse(packageLock), lockIntegrity: sha256(packageLock) };
}

/** Record the clean-installed CSS compiler modules and original CSS inputs. */
export async function recordCssBuild(build, css, extraFiles = []) {
  const moduleRoot = resolve(build.resolveDir, "node_modules");
  const queue = [];
  for (const name of ["postcss", build.lock.packages["node_modules/@tailwindcss/postcss"] ? "@tailwindcss/postcss" : "tailwindcss"]) {
    const filename = build.require.resolve(name);
    const path = relative(moduleRoot, filename).replaceAll("\\", "/");
    if (path === ".." || path.startsWith("../") || isAbsolute(path)) throw new Error(`CSS compiler is outside locked dependencies: ${name}`);
    if (!build.require.cache[filename]) throw new Error("No locked CSS compiler modules were recorded");
    queue.push(build.require.cache[filename]);
  }
  const seen = new Set();
  while (queue.length) {
    const module = queue.pop();
    if (seen.has(module.filename)) continue;
    seen.add(module.filename);
    const path = relative(moduleRoot, module.filename).replaceAll("\\", "/");
    if (path === ".." || path.startsWith("../") || isAbsolute(path)) throw new Error(`CSS compiler dependency is outside locked dependencies: ${path}`);
    queue.push(...module.children);
  }
  const modules = Object.keys(build.require.cache).filter(path => path.startsWith(moduleRoot + "\\") || path.startsWith(moduleRoot + "/"));
  if (!modules.length) throw new Error("No locked CSS compiler modules were recorded");
  const inputs = [];
  for (const path of [...new Set([...modules, ...extraFiles])].sort()) inputs.push({ path: relative(build.resolveDir, path).replaceAll("\\", "/"), integrity: sha256(await readFile(path)) });
  const versions = Object.fromEntries(["tailwindcss", "postcss", "@tailwindcss/postcss", "@tailwindcss/node", "@tailwindcss/oxide"].filter(name => build.lock.packages[`node_modules/${name}`]).map(name => [name, build.lock.packages[`node_modules/${name}`]]));
  build.cssBuild = { verification: "Fresh npm ci --ignore-scripts --no-audit --no-fund --prefer-offline against the committed lock before compilation", lockIntegrity: build.lockIntegrity, cssIntegrity: sha256(css), packages: versions, sourcePackages: build.upstream.cssPackages ?? {}, inputs };
  const licensePath = resolve(build.resolveDir, "node_modules/tailwindcss/LICENSE");
  build.cssNotices = [{ url: build.lock.packages["node_modules/tailwindcss"].resolved, text: await readFile(licensePath, "utf8") }];
}

/** Compile only the classes in the selected upstream examples and components. */
export async function tailwind4(build, css) {
  const input = resolve(build.resolveDir, "preview.css");
  await writeFile(input, css);
  const postcss = build.require("postcss");
  const tailwind = build.require("@tailwindcss/postcss");
  const result = await postcss([tailwind({ base: build.resolveDir, optimize: true })]).process(css, { from: input });
  const dependencies = result.messages.filter(message => message.type === "dependency" && message.file).map(message => resolve(message.file));
  await recordCssBuild(build, result.css, [input, ...dependencies]);
  return result.css;
}

/** Expose only original assets present in this emitted module or stylesheet. */
export function previewAssetProvenance(upstream, { code, css }) {
  return Object.entries(upstream.assets).flatMap(([url, asset]) => {
    if (!code.includes(asset.dataUrl) && !css.includes(asset.dataUrl)) return [];
    const bytes = Buffer.from(asset.dataUrl.split(",")[1], "base64");
    if (sha256(bytes) !== asset.integrity) throw new Error(`Asset integrity mismatch: ${url}`);
    if (!asset.downloadUrl || !asset.resolvedUrl || !asset.attribution?.name || !asset.attribution?.license || !asset.attribution?.url) throw new Error(`Missing original asset attribution: ${url}`);
    return [{ url, downloadUrl: asset.downloadUrl, resolvedUrl: asset.resolvedUrl, sha256: asset.integrity, mediaType: asset.mediaType, bytes: bytes.length, attribution: asset.attribution }];
  });
}

/** Final artifacts contain a closed browser module and the matching upstream CSS. */
export async function emitPreviews(build, { examples, css, aliases, packageName, notices, gaps = [], themeSetup = "", imports = [] }) {
  const entries = {};
  const records = {};
  const dependencyNotices = new Map();
  const sourceNotices = [...notices, ...(build.cssNotices ?? [])];
  const banner = "/*!\n" + sourceNotices.map(notice => `${notice.url}\n${notice.text}`).join("\n\n").replaceAll("*/", "* /") + "\n*/\n";
  for (const example of examples) {
    const entry = resolve(build.sourceRoot, `${example.exportName}.mount.tsx`);
    const demo = example.module.replaceAll("\\", "/");
    await writeFile(entry, `${imports.map(name => `import ${JSON.stringify(name)};`).join("\n")}\nimport { render } from "solid-js/web";\nimport ${example.defaultExport ? "Demo" : `{ ${example.exportName} as Demo }`} from ${JSON.stringify(demo)};\nexport default function mount(target) {\n${themeSetup}\nreturn render(() => <Demo />, target);\n}\n`);
    const compiled = await buildSolidPreview({ entry, resolveDir: build.resolveDir, sourceRoot: build.sourceRoot, runtime: "solid1", aliases, css });
    const code = banner + compiled.code;
    const source = build.upstream.files[example.source];
    if (!source) throw new Error(`Missing upstream component source ${example.source}`);
    const id = `${build.slug}/${example.name}`;
    entries[id] = {
      code, css: compiled.css, package: packageName, version: build.upstream.revision,
      runtimeVersion: "1.9.17", exportName: example.componentExport,
      source: { url: source.url, revision: build.upstream.revision, integrity: source.integrity },
      assets: previewAssetProvenance(build.upstream, { code, css: compiled.css }),
      gaps: [...gaps, ...(example.gaps ?? [])],
    };
    records[id] = { codeIntegrity: sha256(code), cssIntegrity: sha256(compiled.css), lockIntegrity: compiled.lockIntegrity, inputs: compiled.inputs, packages: compiled.packages };
    for (const notice of compiled.notices) dependencyNotices.set(notice.url, { url: notice.url, text: notice.text });
  }
  const sources = Object.values(build.upstream.files).map(({ url, integrity }) => ({ url, integrity }));
  for (const [url, asset] of Object.entries(build.upstream.assets)) sources.push({ url, integrity: asset.integrity });
  const artifact = { entries, sources, notices: [...notices, ...dependencyNotices.values(), ...(build.cssNotices ?? [])] };
  const destination = resolve(root, "data/component-previews/solid", `${build.slug}.json`);
  await mkdir(dirname(destination), { recursive: true });
  const content = JSON.stringify(artifact) + "\n";
  const data = brotliCompressSync(Buffer.from(content), { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).toString("base64");
  await writeFile(destination, JSON.stringify({ encoding: "br", data }) + "\n");
  await writeFile(resolve(build.dataDir, "build.json"), JSON.stringify({ revision: build.upstream.revision, cssBuild: build.cssBuild, records }, null, 2) + "\n");
  console.log(`${build.slug}: ${Object.keys(entries).length} previews (${Buffer.byteLength(JSON.stringify(artifact))} bytes)`);
}
