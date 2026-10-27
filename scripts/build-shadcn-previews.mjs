/** Bundle official shadcn examples with the actual CLI-installed component source.
 * Committed snapshots retain source bytes, configuration and dependency pins so
 * rebuilding does not silently fetch a different registry implementation. */
import { build } from "esbuild";
import { compile } from "@tailwindcss/node";
import { Scanner } from "@tailwindcss/oxide";
import { parse } from "@babel/parser";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, posix, resolve } from "node:path";
import { componentIndex } from "../data/components.ts";

const root = resolve(import.meta.dirname, "..");
const installed = resolve(root, "node_modules/.cache/col-shadcn");
const vendorPath = resolve(root, "data/component-previews/vendor/shadcn-base-nova.json");
const outPath = resolve(root, "data/component-previews/shadcn.json");
const revision = "617134d5810bba521803b3ed787190bacbb80b35";
const prefix = `https://raw.githubusercontent.com/shadcn-ui/ui/${revision}/`;
const styleKey = "shadcn-ui/base-nova";
const hash = (value) => createHash("sha256").update(value).digest("hex");
const requireInstalled = createRequire(resolve(installed, "package.json"));
const requireRoot = createRequire(resolve(root, "package.json"));
let snapshot;
try { snapshot = JSON.parse(await readFile(vendorPath, "utf8")); } catch {
  snapshot = { revision, cliVersion: "4.22.1", configuration: JSON.parse(await readFile(resolve(installed, "components.json"), "utf8")), lockfile: await readFile(resolve(installed, "pnpm-lock.yaml"), "utf8"), dependencies: {}, files: {} };
  async function capture(directory) {
    for (const entry of await readdir(resolve(installed, directory), { withFileTypes: true })) {
      const relative = `${directory}/${entry.name}`;
      if (entry.isDirectory()) await capture(relative);
      else if (/\.(tsx?|jsx?|css)$/.test(relative)) snapshot.files[`cli/${relative}`] = await readFile(resolve(installed, relative), "utf8");
    }
  }
  await capture("src");
}
if (snapshot.revision !== revision) throw new Error("Snapshot revision differs from the reviewed shadcn revision");
const inflight = new Map();
async function source(path) {
  if (path.startsWith("../") || path.startsWith("/")) throw new Error("Source path escapes snapshot");
  if (Object.hasOwn(snapshot.files, path)) return snapshot.files[path];
  if (path.startsWith("cli/")) throw new Error(`Missing installed shadcn source: ${path}`);
  if (!inflight.has(path)) inflight.set(path, (async () => {
    const response = await fetch(prefix + path, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Upstream source HTTP ${response.status}: ${path}`);
    const content = await response.text();
    snapshot.files[path] = content;
    return content;
  })());
  return inflight.get(path);
}
async function sourcePath(path) {
  const candidates = [path, `${path}.tsx`, `${path}.ts`, `${path}.jsx`, `${path}.js`, `${path}/index.tsx`, `${path}/index.ts`];
  const captured = candidates.find(candidate => Object.hasOwn(snapshot.files, candidate));
  if (captured) return captured;
  for (const candidate of candidates) {
    try { await source(candidate); return candidate; } catch (error) {
      if (!String(error).includes("HTTP 404") && !String(error).includes("Missing installed")) throw error;
    }
  }
  throw new Error(`No verified shadcn source: ${path}`);
}
const upstreamPackage = JSON.parse(await source("apps/v4/package.json"));
const upstreamDependencies = { ...upstreamPackage.dependencies, ...upstreamPackage.devDependencies };
async function installedVersion(name) {
  for (const directory of [installed, root]) {
    try {
      const pkg = JSON.parse(await readFile(resolve(directory, "node_modules", name, "package.json"), "utf8"));
      if (pkg.name === name) return pkg.version;
    } catch {}
  }
  for (const require of [requireInstalled, requireRoot]) {
    try {
      const file = require.resolve(`${name}/package.json`);
      return JSON.parse(await readFile(file, "utf8")).version;
    } catch {}
    try {
      let directory = dirname(require.resolve(name));
      for (let depth = 0; depth < 8; depth++) {
        try {
          const pkg = JSON.parse(await readFile(resolve(directory, "package.json"), "utf8"));
          if (pkg.name === name) return pkg.version;
        } catch {}
        const parent = dirname(directory);
        if (parent === directory) break;
        directory = parent;
      }
    } catch {}
  }
}
async function dependencyVersion(name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const locked = snapshot.lockfile.match(new RegExp(`^      ['"]?${escapedName}['"]?:\\r?\\n        specifier: [^\\n]+\\r?\\n        version: (\\d+\\.\\d+\\.\\d+(?:-[\\w.-]+)?)`, "m"))?.[1];
  if (locked) { snapshot.dependencies[name] = locked; return locked; }
  if (snapshot.dependencies[name]) return snapshot.dependencies[name];
  const installed = await installedVersion(name);
  const version = installed ?? upstreamDependencies[name]?.replace(/^[~^]/, "");
  if (!/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(version ?? "")) throw new Error(`No exact shadcn dependency pin: ${name}`);
  snapshot.dependencies[name] = version;
  return version;
}

const license = await source("LICENSE.md");
if (!/MIT License|Permission is hereby granted/.test(license)) throw new Error("Shadcn license requires review");
const output = { entries: {}, styles: {}, unavailable: {}, licenses: { "shadcn-ui/ui": { url: prefix + "LICENSE.md", text: license } } };
const manual = await source("apps/v4/content/docs/installation/manual.mdx");
const css = manual.match(/```css[^\n]*\n([\s\S]*?)\n```/)?.[1];
if (!css?.includes(":root") || !css.includes(".dark")) throw new Error("Official manual theme CSS could not be extracted");
const usedFiles = new Set();
const aliases = [
  ["@/styles/base-nova/ui/", "cli/src/components/ui/"],
  ["@/styles/base-rhea/ui/", "cli/src/components/ui/"],
  ["@/components/ui/", "cli/src/components/ui/"],
  ["@/hooks/", "cli/src/hooks/"],
  ["@/lib/", "cli/src/lib/"],
  ["@/", "apps/v4/"],
];
const replacements = {
  Sonner: { path: "apps/v4/registry/new-york-v4/examples/sonner-demo.tsx" },
  "Message Scroller": { path: "apps/v4/examples/base/message-scroller-opening-position.tsx" },
  Direction: { unavailable: "The official Direction preview requires the documentation site's translation provider and generated RTL source; that environment is not reproduced." },
  Typeset: { path: "apps/v4/app/(app)/(typeset)/lib/fixtures/elements.ts", exportName: "KITCHEN_SINK_HTML" },
};

function demoExport(contents, requested) {
  const ast = parse(contents, { sourceType: "module", plugins: ["typescript", "jsx"] });
  if (requested) return requested;
  if (ast.program.body.some(node => node.type === "ExportDefaultDeclaration")) return "default";
  const names = ast.program.body.flatMap(node => {
    if (node.type !== "ExportNamedDeclaration" || node.exportKind === "type") return [];
    const declaration = node.declaration;
    if (declaration?.type === "FunctionDeclaration") return declaration.id?.name ? [declaration.id.name] : [];
    if (declaration?.type === "VariableDeclaration") return declaration.declarations.filter(value => value.id.type === "Identifier").map(value => value.id.name);
    return [];
  }).filter(name => /^[A-Z]/.test(name));
  const demos = names.filter(name => /Demo$/.test(name));
  if (demos.length === 1) return demos[0];
  if (names.length === 1) return names[0];
  throw new Error(`Official example does not have one unambiguous component export: ${names.join(", ")}`);
}

for (const component of componentIndex["shadcn-ui"]) {
  const id = `shadcn-ui/${component.name}`;
  const alternate = replacements[component.name];
  if (alternate?.unavailable) { output.unavailable[id] = alternate.unavailable; continue; }
  const slug = component.name.toLowerCase().replaceAll(" ", "-");
  const entryPath = alternate?.path ?? `apps/v4/examples/base/${slug}-demo.tsx`;
  const used = new Set();
  try {
    const entrySource = await source(entryPath);
    const entryExport = demoExport(entrySource, alternate?.exportName);
    const demoImport = `import { ${entryExport} as Demo } from ${JSON.stringify(entryPath)};`;
    const entry = component.name === "Typeset"
      ? `${demoImport}\nexport default function Preview(){ return <article className="typeset" dangerouslySetInnerHTML={{__html: Demo}} />; }`
      : component.name === "Sonner"
      ? `${demoImport}\nimport { Toaster } from "@/registry/new-york-v4/ui/sonner"; export default function Preview(){ return <><Demo /><Toaster theme={document.documentElement.classList.contains("dark") ? "dark" : "light"} /></>; }`
      : component.name === "Toast"
      ? `${demoImport}\nimport { Toaster } from "@/components/ui/toast"; export default function Preview(){ return <Toaster><Demo /></Toaster>; }`
      : `${demoImport}\nexport default Demo;`;
    const result = await build({
      stdin: { contents: entry, resolveDir: root, loader: "tsx" },
      bundle: true, write: false, format: "esm", platform: "browser", jsx: "automatic", target: "es2022", minify: true, legalComments: "inline", logLevel: "silent",
      plugins: [{ name: "shadcn-snapshot", setup(builder) {
        builder.onResolve({ filter: /.*/ }, async ({ path, importer }) => {
          let local = path === entryPath ? path : undefined;
          if (path.startsWith(".")) local = posix.normalize(posix.join(posix.dirname(importer), path));
          const alias = aliases.find(([prefix]) => path.startsWith(prefix));
          if (alias) local = alias[1] + path.slice(alias[0].length);
          if (local) return { path: await sourcePath(local), namespace: "snapshot" };
          const name = path.startsWith("@") ? path.split("/").slice(0, 2).join("/") : path.split("/")[0];
          if (["react", "react-dom"].includes(name)) return { path, external: true };
          if (["next", "server-only"].includes(name) || /^(node:|https?:)/.test(path)) throw new Error(`Application service is not reproduced: ${path}`);
          return { path: `${name}@${await dependencyVersion(name)}${path.slice(name.length)}`, external: true };
        });
        builder.onLoad({ filter: /.*/, namespace: "snapshot" }, async ({ path }) => {
          used.add(path); usedFiles.add(path);
          const contents = await source(path);
          if (path.endsWith(".css")) throw new Error(`Additional component stylesheet requires review: ${path}`);
          return { contents, loader: path.endsWith(".json") ? "json" : "tsx" };
        });
      } }],
    });
    const code = result.outputFiles[0].text;
    if (!code.trim() || !/\bexport\s*\{[^}]*\bdefault\b/.test(code)) throw new Error("Official demo did not produce an executable default export");
    const importedStyle = [...used].some(path => path.includes("registry/new-york-v4/")) ? "new-york-v4" : "base-nova";
    output.entries[id] = {
      code, styleKey: component.name === "Typeset" ? `${styleKey}/typeset` : styleKey, package: "shadcn/ui", version: component.name === "Typeset" ? revision.slice(0, 12) : `${importedStyle} (CLI ${snapshot.cliVersion})`, exportName: `${entryExport} (official demo)`,
      source: { url: `https://github.com/shadcn-ui/ui/blob/${revision}/${entryPath}`, revision, integrity: `sha256:${hash(code)}`, files: [...used].sort().map(path => ({ url: path.startsWith("cli/") ? `https://ui.shadcn.com/r/styles/base-nova/${posix.basename(path).replace(/\.tsx?$/, "")}.json` : prefix + path, snapshot: `data/component-previews/vendor/shadcn-base-nova.json#${path}`, sha256: hash(snapshot.files[path]) })) },
      gaps: [`Uses the official shadcn example with actual ${importedStyle} components, lucide icons, neutral theme and CSS variables. Base-style demo import aliases select the installed base-nova files; other styles, locally edited copies, application data and callbacks are not reproduced.`, "Example links and asset paths belong to the upstream documentation. Their destinations and site-relative images are not supplied by your app; blocked resources are reported.", "The preview includes the official manual-install theme CSS. App-specific fonts and additional global styles are not imported."],
    };
    if (["Sidebar", "Avatar"].includes(component.name)) output.entries[id].gaps.push("The original example's avatar image asset is unavailable in this sandbox; the real AvatarFallback is shown. No replacement image is generated.");
    if (["Attachment", "Message"].includes(component.name)) output.entries[id].gaps.push("The original example's sample attachments or image assets are not hosted in this sandbox. Their loading failures are reported; no replacement assets are generated.");
    console.log("BUILT", id);
  } catch (error) {
    const reason = error.errors?.map(value => value.text).join("; ") ?? error.message;
    output.unavailable[id] = reason;
    console.log("UNAVAILABLE", id, reason.slice(0, 200));
  }
}

const cssCache = resolve(root, "node_modules/.cache/col-shadcn-css");
await mkdir(cssCache, { recursive: true });
const shadcnCssKey = "npm:shadcn@4.22.1/dist/tailwind.css";
if (!snapshot.files[shadcnCssKey]) {
  const response = await fetch("https://cdn.jsdelivr.net/npm/shadcn@4.22.1/dist/tailwind.css");
  if (!response.ok) throw new Error(`Shadcn CSS HTTP ${response.status}`);
  snapshot.files[shadcnCssKey] = await response.text();
}
const shadcnCssPath = resolve(cssCache, "shadcn-tailwind.css");
await writeFile(shadcnCssPath, snapshot.files[shadcnCssKey]);
const cssDependencies = new Set();
const compiler = await compile(css, {
  base: root,
  onDependency(path) { cssDependencies.add(path); },
  async customCssResolver(id) { if (id === "shadcn/tailwind.css") return shadcnCssPath; },
});
const scanner = new Scanner({});
const candidates = scanner.scanFiles([...usedFiles].map(path => ({ content: snapshot.files[path], extension: path.split(".").at(-1) })));
output.styles[styleKey] = compiler.build(candidates);
if (output.entries["shadcn-ui/Typeset"]) {
  const typesetPath = "apps/v4/app/(app)/(typeset)/typeset.css";
  const typesetCss = await source(typesetPath);
  const typesetCompiler = await compile(css + "\n" + typesetCss, {
    base: root,
    onDependency(path) { cssDependencies.add(path); },
    async customCssResolver(id) { if (id === "shadcn/tailwind.css") return shadcnCssPath; },
  });
  output.styles[`${styleKey}/typeset`] = typesetCompiler.build(candidates);
  output.entries["shadcn-ui/Typeset"].source.files.push({ url: prefix + typesetPath, snapshot: `data/component-previews/vendor/shadcn-base-nova.json#${typesetPath}`, sha256: hash(typesetCss) });
  output.entries["shadcn-ui/Typeset"].gaps = ["Renders the official Typeset kitchen-sink HTML fixture with the actual upstream stylesheet and manual-install color tokens. App fonts, custom presets and the documentation builder controls are not reproduced."];
}
output.styleSources = {
  [styleKey]: {
    files: [
      { url: prefix + "apps/v4/content/docs/installation/manual.mdx", sha256: hash(manual) },
      { url: "https://cdn.jsdelivr.net/npm/shadcn@4.22.1/dist/tailwind.css", sha256: hash(snapshot.files[shadcnCssKey]) },
    ],
    integrity: `sha256:${hash(output.styles[styleKey])}`,
    dependencies: await Promise.all([...cssDependencies].sort().map(async path => ({ path: path.slice(root.length + 1).replaceAll("\\", "/"), sha256: hash(await readFile(path)) }))),
  },
};
if (output.styles[`${styleKey}/typeset`]) output.styleSources[`${styleKey}/typeset`] = {
  files: [...output.styleSources[styleKey].files, { url: prefix + "apps/v4/app/(app)/(typeset)/typeset.css", sha256: hash(snapshot.files["apps/v4/app/(app)/(typeset)/typeset.css"]) }],
  integrity: `sha256:${hash(output.styles[`${styleKey}/typeset`])}`,
  dependencies: output.styleSources[styleKey].dependencies,
};
output.build = {
  cliVersion: snapshot.cliVersion,
  configuration: snapshot.configuration,
  dependencyPins: { ...snapshot.dependencies, react: "19.3.0", "react-dom": "19.3.0" },
  tailwindVersion: JSON.parse(await readFile(resolve(root, "node_modules/tailwindcss/package.json"), "utf8")).version,
  esbuildVersion: JSON.parse(await readFile(resolve(root, "node_modules/esbuild/package.json"), "utf8")).version,
  installedLockfileSha256: hash(snapshot.lockfile),
};
await mkdir(dirname(vendorPath), { recursive: true });
await writeFile(vendorPath, JSON.stringify(snapshot));
await writeFile(outPath, JSON.stringify(output));
console.log("TOTAL", Object.keys(output.entries).length, "available", Object.keys(output.unavailable).length, "unavailable; CSS", output.styles[styleKey].length);
