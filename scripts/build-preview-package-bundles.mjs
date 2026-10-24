/** Bundle real npm implementations for preview packages whose CDN dependency
 * graphs cannot reliably load. React stays external and is supplied by the
 * preview's single pinned runtime; no component implementation is replaced. */
import { build, transform } from "esbuild";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { parse } from "@babel/parser";
import { packageRecipes } from "../lib/component-preview-packages.ts";

const run = promisify(execFile);
const root = resolve(import.meta.dirname, "..");
const directory = resolve(root, "node_modules/.cache/col-preview-package-bundles");
const outputPath = resolve(root, "data/component-previews/package-bundles.json");
const lockPath = resolve(root, "data/component-previews/vendor/package-bundles-lock.json");
const hash = value => createHash("sha256").update(value).digest("hex");
const extraImports = JSON.parse(await readFile(resolve(root, "data/component-previews/vendor/package-imports.json"), "utf8"));
const projects = [
  { name: "@headlessui/react", version: "2.2.10", exports: "Button, Input, Textarea, Checkbox, Field, Label, Switch, Select, Fieldset, Legend, Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItems, MenuItem, Popover, PopoverButton, PopoverPanel, TabGroup, TabList, Tab, TabPanels, TabPanel, Listbox, ListboxButton, ListboxOptions, ListboxOption, RadioGroup, Radio, Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption, Dialog, DialogPanel, DialogTitle, Description, Transition" },
  { name: "@chakra-ui/react", version: "3.37.0", exports: "Button, Dialog, Menu, Tabs, Table, Slider, Select, createListCollection, ChakraProvider, defaultSystem" },
  { name: "@awesome.me/webawesome", version: "3.14.0", wrappers: ["button", "input", "dialog", "drawer", "select", "option", "tab-group", "tab", "tab-panel"] },
  { name: "sonner", version: "2.0.0", exports: "*" },
  { name: "react-resizable-panels", version: "4.14.8", exports: "*" },
  { name: "@tabler/icons-react", version: "3.31.0", exports: "IconFolderCode" },
  { name: "@tanstack/react-table", version: "9.0.0", exports: "columnFilteringFeature, columnVisibilityFeature, createColumnHelper, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel, filterFn_includesString, rowPaginationFeature, rowSelectionFeature, rowSortingFeature, sortFn_alphanumeric, sortFn_text, tableFeatures, useTable" },
  { name: "@shadcn/react", version: "0.3.1", subpath: "message-scroller", exports: "*" },
  { name: "@shadcn/react", version: "0.3.1", subpath: "questionnaire", exports: "*" },
  { name: "react-aria-components", version: "1.22.0", imports: Object.entries(extraImports).filter(([name]) => name.startsWith("react-aria-components@1.22.0/")) },
  { name: "@hugeicons/react", version: "1.1.7", exports: extraImports["@hugeicons/react@1.1.7"].join(", ") },
  { name: "@tabler/icons-react", version: "3.49.0", exports: extraImports["@tabler/icons-react@3.49.0"].join(", ") },
];
// Read every advertised preview before choosing exports, so a fallback for one
// failing demo cannot hide other genuine exports used elsewhere in the catalog.
const observed = new Map();
const importSources = Object.values(packageRecipes).map(recipe => recipe.imports);
for (const file of ["extra.json", "shadcn.json"]) {
  const previews = JSON.parse(await readFile(resolve(root, "data/component-previews", file), "utf8"));
  importSources.push(...Object.values(previews.entries).map(entry => entry.code));
}
for (const code of importSources) for (const statement of parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] }).program.body) {
  if (statement.type !== "ImportDeclaration") continue;
  const names = observed.get(statement.source.value) ?? new Set();
  for (const specifier of statement.specifiers) if (specifier.type === "ImportSpecifier") names.add(specifier.imported.name ?? specifier.imported.value);
  observed.set(statement.source.value, names);
}
for (const project of projects) {
  const key = `${project.name}@${project.version}${project.subpath ? `/${project.subpath}` : ""}`;
  if (project.exports && project.exports !== "*") project.exports = [...new Set([...project.exports.split(", "), ...(observed.get(key) ?? [])])].sort().join(", ");
}
const installName = project => new Set(projects.filter(item => item.name === project.name).map(item => item.version)).size > 1 ? `col-preview-${hash(`${project.name}@${project.version}`).slice(0, 12)}` : project.name;
const manifest = { private: true, dependencies: { ...Object.fromEntries(projects.map(project => [installName(project), installName(project) === project.name ? project.version : `npm:${project.name}@${project.version}`])), react: "19.3.0", "react-dom": "19.3.0", "@emotion/react": "11.14.0" } };
await mkdir(directory, { recursive: true });
await writeFile(resolve(directory, "package.json"), JSON.stringify(manifest));
{
  const existingLock = await readFile(lockPath, "utf8").catch(() => readFile(resolve(directory, "package-lock.json"), "utf8").catch(() => undefined));
  if (existingLock) await writeFile(resolve(directory, "package-lock.json"), existingLock);
  const npm = resolve(dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
  const cache = resolve(directory, "npm-cache");
  const temporary = resolve(directory, "tmp");
  await mkdir(temporary, { recursive: true });
  if (!existingLock || process.argv.includes("--update-lock")) {
    await run(process.execPath, [npm, "install", "--package-lock-only", "--prefer-offline", "--ignore-scripts", "--legacy-peer-deps", "--no-audit", "--no-fund"], { cwd: directory, env: { ...process.env, npm_config_cache: cache, TEMP: temporary, TMP: temporary }, timeout: 1_800_000, maxBuffer: 1_000_000, windowsHide: true });
  }
  const installLock = JSON.parse(await readFile(resolve(directory, "package-lock.json"), "utf8"));
  const missingIntegrity = Object.entries(installLock.packages).filter(([path, value]) => path && (!value.integrity || !value.resolved));
  let pending = 0;
  await Promise.all(Array.from({ length: Math.min(12, missingIntegrity.length) }, async () => {
    while (pending < missingIntegrity.length) {
      const [path, value] = missingIntegrity[pending++];
      const name = value.name ?? path.slice(path.lastIndexOf("node_modules/") + "node_modules/".length);
      const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/${encodeURIComponent(value.version)}`, { signal: AbortSignal.timeout(120_000) });
      if (!response.ok) throw new Error(`Cannot verify locked package ${name}@${value.version}: HTTP ${response.status}`);
      const metadata = await response.json();
      if (metadata.name !== name || metadata.version !== value.version || !metadata.dist?.integrity || !metadata.dist?.tarball) throw new Error(`Missing official npm integrity for ${name}@${value.version}`);
      value.integrity = metadata.dist.integrity;
      value.resolved = metadata.dist.tarball;
    }
  }));
  if (missingIntegrity.length) await writeFile(resolve(directory, "package-lock.json"), JSON.stringify(installLock, null, 2) + "\n");
  console.log("Restoring exact npm tarballs and verifying their integrity...");
  await run(process.execPath, [npm, "ci", "--prefer-offline", "--ignore-scripts", "--legacy-peer-deps", "--no-audit", "--no-fund"], { cwd: directory, env: { ...process.env, npm_config_cache: cache, TEMP: temporary, TMP: temporary }, timeout: 1_800_000, maxBuffer: 1_000_000, windowsHide: true });
  console.log("Authenticated npm install complete; bundling actual exports...");
}
const lockText = await readFile(resolve(directory, "package-lock.json"), "utf8");
const lock = JSON.parse(lockText);
const output = {};
for (const project of projects) {
  const projectKey = `${project.name}@${project.version}${project.subpath ? `/${project.subpath}` : ""}`;
  const installedName = installName(project);
  const importMappings = project.imports ? Object.fromEntries(project.imports.map(([specifier, names], index) => [specifier, Object.fromEntries(names.map(name => [name, `Subpath${index}_${name}`]))])) : undefined;
  const names = project.wrappers?.map(value => "Wa" + value.split("-").map(part => part[0].toUpperCase() + part.slice(1)).join(""));
  const entry = project.imports
    ? project.imports.map(([specifier, names]) => `export { ${names.map(name => `${name} as ${importMappings[specifier][name]}`).join(", ")} } from ${JSON.stringify(installedName + specifier.slice(`${project.name}@${project.version}`.length))};`).join("\n")
    : project.wrappers
      ? project.wrappers.map((path, index) => `export { default as ${names[index]} } from "${installedName}/dist/react/${path}/index.js";`).join("\n")
      : `export ${project.exports === "*" ? "*" : `{ ${project.exports} }`} from ${JSON.stringify(installedName + (project.subpath ? `/${project.subpath}` : ""))};`;
  const result = await build({
    absWorkingDir: root,
    stdin: { contents: entry, resolveDir: directory, loader: "js" },
    bundle: true, write: false, format: "esm", platform: "browser", target: "es2019", minifyIdentifiers: true, minifySyntax: true, minifyWhitespace: false, legalComments: "inline", metafile: true,
    define: { "process.env.NODE_ENV": '"production"' },
    external: ["react", "react/*", "react-dom", "react-dom/*"],
    logLevel: "silent",
  });
  const code = (await transform(result.outputFiles[0].text, { format: "iife", globalName: "ColLibraryExports", target: "es2019", minifyIdentifiers: true, minifySyntax: true, minifyWhitespace: false, legalComments: "inline" })).code;
  if (!code.includes("ColLibraryExports")) throw new Error(`Empty package bundle: ${project.name}`);
  const externals = [...new Set(Object.values(result.metafile.outputs).flatMap(value => value.imports.filter(item => item.external).map(item => item.path)))].sort();
  if (externals.some(name => !/^react(?:-dom)?(?:\/|$)/.test(name))) throw new Error(`Unexpected external package in ${project.name}: ${externals.join(", ")}`);
  const packages = new Set();
  for (const path of Object.keys(result.metafile.inputs)) {
    if (path === "<stdin>") continue;
    const absolute = resolve(root, path);
    let folder = dirname(absolute);
    while (folder.startsWith(directory)) {
      try { const pkg = JSON.parse(await readFile(resolve(folder, "package.json"), "utf8")); if (pkg.name && pkg.version) { packages.add(folder); break; } } catch {}
      const parent = dirname(folder);
      if (parent === folder) break;
      folder = parent;
    }
  }
  const licenses = [];
  for (const folder of [...packages].sort()) {
    const pkg = JSON.parse(await readFile(resolve(folder, "package.json"), "utf8"));
    const files = (await readdir(folder)).filter(name => /^(?:licen[cs]e|copying|notice)(?:\.|$)/i.test(name));
    for (const name of files) {
      const text = await readFile(resolve(folder, name), "utf8").catch(() => undefined);
      if (text) licenses.push({ package: pkg.name, version: pkg.version, file: name, text });
    }
  }
  const sourceFiles = await Promise.all(Object.keys(result.metafile.inputs).filter(path => path !== "<stdin>").sort().map(async path => {
    const absolute = resolve(root, path);
    const sourcePath = relative(directory, absolute).replaceAll("\\", "/");
    if (isAbsolute(sourcePath) || sourcePath === ".." || sourcePath.startsWith("../")) throw new Error(`Bundle escaped its exact locked package graph: ${path}`);
    return { path: sourcePath, sha256: hash(await readFile(absolute)) };
  }));
  const npmIntegrity = lock.packages[`node_modules/${installedName}`]?.integrity;
  if (!npmIntegrity) throw new Error(`Missing verified tarball integrity for ${project.name}@${project.version}`);
  output[projectKey] = {
    code, externals, exports: Object.values(result.metafile.outputs)[0].exports, ...(importMappings ? { importMappings } : {}),
    source: { package: project.name, version: project.version, url: `https://registry.npmjs.org/${project.name}/-/${project.name.split("/").at(-1)}-${project.version}.tgz`, integrity: `sha256:${hash(code)}`, npmIntegrity, files: sourceFiles },
    licenses, warnings: result.warnings.map(warning => warning.text), lockfileSha256: hash(lockText),
  };
  console.log(`Bundled ${project.name}@${project.version}: ${code.length} characters; externals ${externals.join(", ")}; ${licenses.length} license files.`);
}
await mkdir(dirname(lockPath), { recursive: true });
await writeFile(lockPath, lockText);
await writeFile(outputPath, JSON.stringify(output));
