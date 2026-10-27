/** Compile published library CSS without recreating its theme or component rules.
 * Downloads are confined to build time, pinned npm releases, and a local cache.
 * Source hashes and license text accompany the generated stylesheet. */
import { compile } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const packageName = "@heroui/styles";
const version = "3.2.6";
const packageKey = `${packageName}@${version}`;
const origin = `https://cdn.jsdelivr.net/npm/${packageKey}`;
const cacheRoot = resolve(root, "node_modules/.cache/col-heroui-css");
const packageRoot = resolve(cacheRoot, "node_modules/@heroui/styles");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function fetchText(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Upstream CSS HTTP ${response.status}: ${url}`);
  return response.text();
}

await mkdir(packageRoot, { recursive: true });
const listingUrl = `https://data.jsdelivr.com/v1/package/npm/${packageKey}/flat`;
const listing = JSON.parse(await fetchText(listingUrl));
const selected = listing.files.filter(({ name }) => name === "/package.json" || name === "/LICENSE" || /^\/dist\/.*\.(css|js)$/.test(name));
const sources = new Map();
let next = 0;
// Limit simultaneous upstream requests; preserve each file's original bytes.
await Promise.all(Array.from({ length: 8 }, async () => {
  while (next < selected.length) {
    const file = selected[next++];
    const target = resolve(packageRoot, file.name.slice(1));
    if (!target.startsWith(packageRoot + sep)) throw new Error("Upstream CSS path escapes package cache");
    let content;
    try { content = await readFile(target, "utf8"); } catch {}
    if (!content || createHash("sha256").update(content).digest("base64") !== file.hash) content = await fetchText(origin + file.name);
    if (createHash("sha256").update(content).digest("base64") !== file.hash) throw new Error(`Upstream CSS integrity mismatch: ${file.name}`);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
    sources.set(file.name, content);
  }
}));

const dependencies = new Set();
const entry = resolve(packageRoot, "dist/index.css");
const compiler = await compile(`@import ${JSON.stringify(entry.replaceAll("\\", "/"))};`, {
  base: root,
  onDependency(path) { dependencies.add(path); },
});
const scanner = new Scanner({});
const candidates = scanner.scanFiles([...sources].filter(([name]) => name.endsWith(".js")).map(([, content]) => ({ content, extension: "js" })));
const css = compiler.build(candidates);
if (/@(?:import|apply|theme|utility|custom-variant)\b/.test(css)) throw new Error("Uncompiled CSS directives remain in the stylesheet");
if (!css.includes(".button") || !css.includes(".checkbox") || !css.includes(".dark")) throw new Error("Compiled HeroUI CSS is missing expected component or theme rules");
const tailwind = JSON.parse(await readFile(resolve(root, "node_modules/tailwindcss/package.json"), "utf8"));
const animation = JSON.parse(await readFile(resolve(root, "node_modules/tw-animate-css/package.json"), "utf8"));
const upstream = JSON.parse(sources.get("/package.json"));
if (animation.version !== upstream.dependencies["tw-animate-css"]) throw new Error("Installed animation stylesheet differs from HeroUI's exact dependency");
const fileHashes = [...sources].sort(([a], [b]) => a.localeCompare(b)).map(([path, content]) => ({ url: origin + path, sha256: hash(content) }));
const dependencyHashes = await Promise.all([...dependencies].filter((path) => !path.startsWith(packageRoot + sep)).sort().map(async (path) => ({ path: path.slice(root.length + 1).replaceAll("\\", "/"), sha256: hash(await readFile(path)) })));
const result = { [packageKey]: {
  css,
  source: { package: packageName, version, url: origin + "/dist/index.css", integrity: "sha256:" + hash(css), files: fileHashes },
  compiler: { package: "tailwindcss", version: tailwind.version, dependencies: dependencyHashes },
  license: { name: upstream.license, url: origin + "/LICENSE", text: sources.get("/LICENSE") },
} };
await mkdir(resolve(root, "data/component-previews"), { recursive: true });
await writeFile(resolve(root, "data/component-previews/package-styles.json"), JSON.stringify(result));
console.log(`Compiled ${packageKey}: ${css.length} CSS characters from ${sources.size} verified upstream files; Tailwind ${tailwind.version}.`);
