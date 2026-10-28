/** Compile reviewed Solid examples into self-contained browser modules. */
import { build } from "esbuild";
import { transform } from "@solidjs/compiler";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { authenticateRuntimeFile, restoreArchive, resolveNpmCli } from "./preview-package-archive.mjs";
import { QUOIN_VERSION, SOLID_VERSION } from "../data/quoin/catalog.ts";

const root = resolve(import.meta.dirname, "..");
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const examples = JSON.parse(await readFile(resolve(root, "data/quoin/examples.json"), "utf8"));
const lock = JSON.parse(await readFile(resolve(root, "package-lock.json"), "utf8"));
for (const [name, version] of Object.entries({ "quoin-ui": QUOIN_VERSION, "solid-js": SOLID_VERSION, "@solidjs/web": SOLID_VERSION, "@solidjs/signals": SOLID_VERSION, "@solidjs/compiler": SOLID_VERSION })) {
  if (lock.packages[`node_modules/${name}`]?.version !== version) throw new Error(`Expected ${name}@${version}`);
}
const entries = {};
const inputs = new Set();
for (const [name, example] of Object.entries(examples)) {
  const compiled = transform(example.code, { filename: "example.tsx", generate: "dom", moduleName: "@solidjs/web", hydratable: false });
  if (compiled.errors?.length) throw new Error(`${name}: ${JSON.stringify(compiled.errors)}`);
  const result = await build({
    stdin: { contents: 'import Demo from "col:example"; import { render } from "@solidjs/web"; export default function mount(target) { return render(() => Demo({}), target); }', resolveDir: root, sourcefile: "mount.js" },
    bundle: true, write: false, format: "esm", platform: "browser", target: "es2022",
    conditions: ["browser"], mainFields: ["browser", "module", "main"],
    minify: true, legalComments: "inline", metafile: true,
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [{ name: "reviewed-example", setup(builder) {
      builder.onResolve({ filter: /^col:example$/ }, () => ({ path: "example", namespace: "col" }));
      builder.onLoad({ filter: /.*/, namespace: "col" }, () => ({ contents: compiled.code, loader: "ts", resolveDir: root }));
    } }],
  });
  const code = result.outputFiles[0].text;
  if (Object.values(result.metafile.outputs).some(output => output.imports.length)) throw new Error(`${name} has an external dependency`);
  for (const path of Object.keys(result.metafile.inputs)) if (path.startsWith("node_modules/")) inputs.add(path);
  entries[name] = { code, integrity: hash(code), exampleIntegrity: hash(example.code + "\n" + example.css) };
}

// Verify every bundled dependency byte against its locked official npm archive.
const packages = new Map();
for (const input of inputs) {
  let path = dirname(input).replaceAll("\\", "/");
  while (!lock.packages[path] && path !== ".") path = dirname(path).replaceAll("\\", "/");
  if (!lock.packages[path]) throw new Error(`No locked package owns ${input}`);
  packages.set(path, lock.packages[path]);
}
const cache = resolve(root, "node_modules/.cache/col-quoin-archives");
await mkdir(cache, { recursive: true });
const { Parser } = createRequire(resolveNpmCli())("tar");
const expectedHashes = new Map();
const notices = [];
for (const [path, pkg] of packages) {
  if (!pkg.resolved?.startsWith("https://registry.npmjs.org/") || !pkg.integrity) throw new Error(`Missing npm integrity: ${path}`);
  const cached = resolve(cache, hash(pkg.integrity) + ".tgz");
  let bytes;
  if (existsSync(cached)) bytes = await readFile(cached);
  else {
    const response = await fetch(pkg.resolved, { signal: AbortSignal.timeout(60_000) });
    if (!response.ok) throw new Error(`Cannot authenticate ${path}: ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  restoreArchive({ bytes, integrity: pkg.integrity, installRoot: root, packagePath: path, Parser,
    allowFile: () => true, verifiedFiles: new Set(), expectedHashes, restoreFile: () => false });
  if (!existsSync(cached)) await writeFile(cached, bytes);
  const licensePaths = [...expectedHashes.keys()].filter(file => file.startsWith(path + "/") && /^licen[cs]e(?:\.[^/]*)?$/i.test(relative(path, file)));
  if (!licensePaths.length) {
    if (!["solid-js", "@solidjs/web", "@solidjs/signals"].some(name => path === `node_modules/${name}`)) throw new Error(`Missing license for ${path}`);
    const content = await readFile(resolve(root, "data/quoin/solid-LICENSE.txt"));
    if (hash(content) !== "59a76ed2f4a3ebe8d20a58869ef9c09420f796aa179420c8fb916f5557defc9b") throw new Error("Solid license changed");
    notices.push({ package: path.slice("node_modules/".length), version: pkg.version, text: content.toString("utf8"),
      url: "https://github.com/solidjs/solid/blob/225014bf8757421a2ea0a9c6ddc148b965eed000/LICENSE", sha256: hash(content) });
  }
  for (const license of licensePaths) {
    const content = await readFile(resolve(root, license));
    authenticateRuntimeFile(content, license, expectedHashes);
    notices.push({ package: path.slice("node_modules/".length), version: pkg.version, text: content.toString("utf8") });
  }
}
const files = [];
for (const path of [...inputs].sort()) files.push({ path, sha256: authenticateRuntimeFile(await readFile(resolve(root, path)), path, expectedHashes) });
// These notices must travel with each delivered module, not only the build manifest.
const licenseBanner = "/*!\n" + notices.map(notice => `${notice.package}@${notice.version}\n${notice.text}`).join("\n\n").replaceAll("*/", "* /") + "\n*/\n";
for (const entry of Object.values(entries)) {
  entry.code = licenseBanner + entry.code;
  entry.integrity = hash(entry.code);
}
const artifact = { package: "quoin-ui", version: QUOIN_VERSION, runtimeVersion: SOLID_VERSION,
  source: { packages: Object.fromEntries([...packages].map(([path, pkg]) => [path, { version: pkg.version, resolved: pkg.resolved, integrity: pkg.integrity }])), files, notices }, entries };
await writeFile(resolve(root, "data/component-previews/quoin.json"), JSON.stringify(artifact) + "\n");
console.log(`Built ${Object.keys(entries).length} Quoin examples; authenticated ${files.length} files in ${packages.size} packages.`);
