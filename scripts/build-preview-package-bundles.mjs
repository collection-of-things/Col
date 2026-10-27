/** Bundle real npm implementations for preview packages whose CDN dependency
 * graphs cannot reliably load. React stays external and is supplied by the
 * preview's single pinned runtime; no component implementation is replaced. */
import { build, transform } from "esbuild";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { authenticateArchive, authenticateRuntimeFile, readVerifiedMetadata, restoreArchive, resolveNpmCli } from "./preview-package-archive.mjs";
import { parse } from "@babel/parser";
import { packageRecipes } from "../lib/component-preview-packages.ts";
import { adaptPreviewSourceImports } from "../lib/component-preview-source-adapters.ts";

const run = promisify(execFile);
const root = resolve(import.meta.dirname, "..");
const supplemental = process.argv.includes("--supplemental");
const verifyInstalledRuntime = process.argv.includes("--verify-installed-runtime");
const restoreRuntimeFiles = process.argv.includes("--restore-runtime-files") || verifyInstalledRuntime;
const verifiedRuntimeFiles = new Set();
const expectedRuntimeHashes = new Map();
const isPackageMetadata = path => /(?:^|\/)(?:package\.json|licen[cs]e(?:\.[^/]*)?|notice(?:\.[^/]*)?|copying(?:\.[^/]*)?|readme(?:\.[^/]*)?)$/i.test(path);
const artifactName = supplemental ? "package-bundles-supplemental" : "package-bundles";
const directory = resolve(root, `node_modules/.cache/col-preview-${artifactName}`);
const outputPath = resolve(root, `data/component-previews/${artifactName}.json`);
const lockPath = resolve(root, `data/component-previews/vendor/${artifactName}-lock.json`);
const hash = value => createHash("sha256").update(value).digest("hex");
const extraImports = JSON.parse(await readFile(resolve(root, "data/component-previews/vendor/package-imports.json"), "utf8"));
const upstreamNotices = JSON.parse(await readFile(resolve(root, "data/component-previews/vendor/package-license-notices.json"), "utf8"));
const projects = supplemental ? [] : [
  { name: "@headlessui/react", version: "2.2.10", exports: "Button, Input, Textarea, Checkbox, Field, Label, Switch, Select, Fieldset, Legend, Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItems, MenuItem, Popover, PopoverButton, PopoverPanel, TabGroup, TabList, Tab, TabPanels, TabPanel, Listbox, ListboxButton, ListboxOptions, ListboxOption, RadioGroup, Radio, Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption, Dialog, DialogPanel, DialogTitle, Description, Transition" },
  { name: "@chakra-ui/react", version: "3.37.0", exports: "Button, Dialog, Menu, Tabs, Table, Slider, Select, createListCollection, ChakraProvider, defaultSystem" },
  { name: "@awesome.me/webawesome", version: "3.14.0", wrappers: ["button", "input", "dialog", "drawer", "select", "option", "tab-group", "tab", "tab-panel"], helpers: { "dist/components/icon/library.js": ["getIconLibrary", "registerIconLibrary"] } },
  { name: "sonner", version: "2.0.0", exports: "*", stylesheets: ["dist/styles.css"] },
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
  importSources.push(...Object.entries(previews.entries).map(([id, entry]) => adaptPreviewSourceImports(id, entry.code)));
}
for (const code of importSources) for (const statement of parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] }).program.body) {
  if (statement.type !== "ImportDeclaration") continue;
  const names = observed.get(statement.source.value) ?? new Set();
  for (const specifier of statement.specifiers) {
    if (specifier.type === "ImportSpecifier") names.add(specifier.imported.name ?? specifier.imported.value);
    else if (supplemental) names.add(specifier.type === "ImportDefaultSpecifier" ? "default" : "*");
  }
  observed.set(statement.source.value, names);
}
if (supplemental) {
  // Context-bearing packages share one graph, including every observed subpath.
  const groups = [
    ["tailwind-variants", "3.2.2"], ["lucide-react", "1.17.0"],
    ["@heroicons/react", "2.2.0"],
    ["@internationalized/number", "3.6.9"],
    ["@headless-tree/core", "1.6.3", { "@headless-tree/react": "1.6.3" }],
    ["lucide-react", "0.474.0"],
    ["lucide-react", "0.544.0"],
    ["@radix-ui/react-icons", "1.3.2"],
    ["canvas-confetti", "1.9.3"],
    ["svg-dotted-map", "2.0.1"], ["cobe", "0.6.4"],
    ["date-fns", "4.1.0"], ["@date-fns/tz", "1.5.0"],
    ["react-day-picker", "9.11.0"], ["@shikijs/transformers", "2.5.0"],
    ["react-icons", "5.5.0"], ["fuse.js", "7.1.0"], ["react-dropzone", "14.3.8"],
    ["tippy.js", "6.3.7"],
    ["@dnd-kit/core", "6.3.1", { "@dnd-kit/modifiers": "9.0.0", "@dnd-kit/sortable": "10.0.0", "@dnd-kit/utilities": "3.2.2" }],
    ["@uidotdev/usehooks", "2.4.1"], ["lodash.throttle", "4.1.1"], ["lodash.groupby", "4.6.0"],
    ["poline", "0.7.0"], ["cobe", "2.0.1"], ["three", "0.168.0"], ["react-player", "2.16.0"],
    ["react-aria-components", "1.22.1"],
    ["lucide-react", "0.545.0"], ["react-tweet", "3.2.2"],
    ["jotai", "2.15.0"], ["jotai", "2.1.0"], ["shiki", "3.13.0", { "@shikijs/transformers": "3.13.0" }],
    ["color", "5.0.2"], ["react-svg-credit-card-payment-icons", "4.2.1"],
    ["@faker-js/faker", "10.0.0"], ["tunnel-rat", "0.1.2"], ["react-fast-marquee", "1.6.5"],
    ["culori", "4.0.2"], ["@codesandbox/sandpack-react", "2.20.0"],
    ["media-chrome", "4.14.0"], ["@paper-design/shaders-react", "0.0.72"],
    ["@hugeicons/react", "1.1.5"], ["@tabler/icons-react", "3.34.1"], ["motion", "12.35.2"],
    ["border-beam", "1.0.1"], ["@hugeicons/core-free-icons", "3.1.1"], ["react-use-measure", "2.1.1"],
    ["metal-fx", "1.0.4"], ["gsap", "3.13.0"], ["@tanstack/react-table", "9.3.1"],
    ["@tiptap/core", "3.6.6", {
      "highlight.js": "11.11.1", "lowlight": "3.3.0",
      "@tiptap/extension-code-block-lowlight": "3.6.6", "@tiptap/extension-list": "3.6.6",
      "@tiptap/extension-subscript": "3.6.6", "@tiptap/extension-superscript": "3.6.6",
      "@tiptap/extension-table": "3.6.6", "@tiptap/extension-text-style": "3.6.6",
      "@tiptap/extension-typography": "3.6.6", "@tiptap/extensions": "3.6.6",
      "@tiptap/pm": "3.6.6", "@tiptap/react": "3.6.6", "@tiptap/starter-kit": "3.6.6", "@tiptap/suggestion": "3.6.6",
    }],
    ["@radix-ui/react-dropdown-menu", "2.1.5", { "@radix-ui/react-slider": "1.3.5", "@radix-ui/react-scroll-area": "1.2.3", "@radix-ui/react-avatar": "1.1.2" }],
    ["use-stick-to-bottom", "1.1.1"],
    ["streamdown", "1.6.10"],
    ["@base-ui/react", "1.5.0"],
    ["@base-ui/react", "1.3.0"],
    ["@react-three/drei", "10.7.6", { "@react-three/fiber": "9.3.0", three: "0.180.0" }],
    ["next-themes", "0.4.6"], ["cn", "0.2.4"], ["cn", "0.3.0"],
    ["class-variance-authority", "0.7.1"], ["clsx", "2.1.1"],
    ["tailwind-merge", "3.0.1"], ["@radix-ui/react-slot", "1.2.3"],
  ];
  for (const [name, version, dependencies = {}] of groups) {
    const pins = Object.entries({ [name]: version, ...dependencies }).map(([pkg, pin]) => pkg + "@" + pin);
    const imports = [...observed].filter(([specifier]) => pins.some(pin => specifier === pin || specifier.startsWith(pin + "/"))).map(([specifier, names]) => [specifier, [...names].sort()]);
    projects.push({ name, version, dependencies, imports });
  }
}
for (const project of projects) {
  const key = `${project.name}@${project.version}${project.subpath ? `/${project.subpath}` : ""}`;
  if (project.exports && project.exports !== "*") project.exports = [...new Set([...project.exports.split(", "), ...(observed.get(key) ?? [])])].sort().join(", ");
}
// Root aliases must also account for another graph's dependency version, or the
// manifest merge silently replaces the root pin and bundles the wrong release.
const installName = project => new Set(projects.flatMap(item => [
  ...(item.name === project.name ? [item.version] : []),
  ...(item.dependencies?.[project.name] ? [item.dependencies[project.name]] : []),
])).size > 1 ? `col-preview-${hash(`${project.name}@${project.version}`).slice(0, 12)}` : project.name;
const manifest = { private: true, dependencies: { ...Object.fromEntries(projects.map(project => [installName(project), installName(project) === project.name ? project.version : `npm:${project.name}@${project.version}`])), ...Object.assign({}, ...projects.map(project => project.dependencies)), react: "19.3.0", "react-dom": "19.3.0", ...(supplemental ? {} : { "@emotion/react": "11.14.0" }) } };
const selectedNames = process.argv.find(value => value.startsWith("--only="))?.slice("--only=".length).split(",");
if (selectedNames && process.argv.includes("--update-lock")) throw new Error("Targeted rebuilds require the unchanged authenticated lockfile");
const selectedProjects = selectedNames ? projects.filter(project => selectedNames.includes(project.name)) : projects;
if (selectedNames && selectedNames.some(name => !selectedProjects.some(project => project.name === name))) throw new Error("Unknown targeted package");
await mkdir(directory, { recursive: true });
await writeFile(resolve(directory, "package.json"), JSON.stringify(manifest));
{
  const existingLock = process.argv.includes("--use-cached-lock")
    ? await readFile(resolve(directory, "package-lock.json"), "utf8")
    : await readFile(lockPath, "utf8").catch(() => readFile(resolve(directory, "package-lock.json"), "utf8").catch(() => undefined));
  if ((selectedNames || process.argv.includes("--use-cached-lock")) && !process.argv.includes("--update-lock")) {
    if (!existingLock) throw new Error("Targeted or cached rebuilds require an existing authenticated lockfile");
    const locked = JSON.parse(existingLock).packages[""].dependencies;
    if (Object.keys(locked).length !== Object.keys(manifest.dependencies).length || Object.entries(manifest.dependencies).some(([name, version]) => locked[name] !== version)) throw new Error("Cached lockfile does not match requested exact dependencies");
  }
  if (existingLock) await writeFile(resolve(directory, "package-lock.json"), existingLock);
  const npm = resolveNpmCli();
  const cache = resolve(directory, "npm-cache");
  const temporary = resolve(directory, "tmp");
  await mkdir(temporary, { recursive: true });
  if (!existingLock || process.argv.includes("--update-lock")) {
    await run(process.execPath, [npm, "install", "--package-lock-only", "--prefer-offline", "--ignore-scripts", "--legacy-peer-deps", "--no-audit", "--no-fund"], { cwd: directory, env: { ...process.env, npm_config_cache: cache, TEMP: temporary, TMP: temporary }, timeout: 1_800_000, maxBuffer: 1_000_000, windowsHide: true });
  }
  const installLock = JSON.parse(await readFile(resolve(directory, "package-lock.json"), "utf8"));
  if (selectedNames && (!existingLock || await readFile(resolve(directory, "package-lock.json"), "utf8") !== existingLock)) throw new Error("Targeted rebuild changed the lockfile");
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
  if (restoreRuntimeFiles) {
    // Windows can spend minutes unpacking unused declarations and demo trees.
    // Authenticate the whole tarball and restore runtime files. On a retry,
    // preserve installed files but compare every esbuild input with its original
    // archive hash before writing output; stale cached source can never pass.
    const tar = createRequire(npm)("tar");
    const previous = existsSync(outputPath) ? JSON.parse(readFileSync(outputPath, "utf8")) : {};
    const knownFiles = new Set(Object.values(previous).filter(bundle => !selectedNames || selectedNames.includes(bundle.source.package)).flatMap(bundle => bundle.source.files.map(file => file.path)));
    for (const project of selectedProjects) for (const path of [...Object.keys(project.helpers ?? {}), ...(project.stylesheets ?? [])]) knownFiles.add(`node_modules/${installName(project)}/${path}`);
    let restored = 0;
    const packages = Object.entries(installLock.packages).filter(([path]) => path);
    const archives = new Map();
    let cursor = 0;
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (cursor < packages.length) {
        const [path, pkg] = packages[cursor++];
        const integrity = pkg.integrity.split(/\s+/).find(value => value.startsWith("sha512-")) ?? pkg.integrity.split(/\s+/)[0];
        const [algorithm, expected] = integrity.split("-");
        if (!["sha512", "sha256", "sha1"].includes(algorithm)) throw new Error(`Unsupported locked integrity for ${path}`);
        const digest = Buffer.from(expected, "base64").toString("hex");
        const cached = resolve(cache, "_cacache/content-v2", algorithm, digest.slice(0, 2), digest.slice(2, 4), digest.slice(4));
        let bytes;
        if (existsSync(cached)) bytes = readFileSync(cached);
        else {
          if (!pkg.resolved.startsWith("https://registry.npmjs.org/")) throw new Error(`Expected official npm tarball for ${path}`);
          const response = await fetch(pkg.resolved, { signal: AbortSignal.timeout(120_000) });
          if (!response.ok) throw new Error(`Cannot restore ${path}: HTTP ${response.status}`);
          bytes = Buffer.from(await response.arrayBuffer());
        }
        authenticateArchive(bytes, pkg.integrity);
        if (!existsSync(cached)) {
          mkdirSync(dirname(cached), { recursive: true });
          writeFileSync(cached, bytes);
        }
        archives.set(path, cached);
      }
    }));
    console.log(`Authenticated ${packages.length} complete npm archives; ${verifyInstalledRuntime ? "verifying installed runtime files" : "restoring runtime files"}...`);
    for (const [path, pkg] of packages) {
        const bytes = readFileSync(archives.get(path));
        restoreArchive({ bytes, integrity: pkg.integrity, installRoot: directory, packagePath: path, Parser: tar.Parser, verifiedFiles: verifiedRuntimeFiles, expectedHashes: expectedRuntimeHashes, restoreFile: local => !verifyInstalledRuntime || isPackageMetadata(local) || !existsSync(resolve(directory, path, local)), allowFile: (local, sourcePath) => {
          const metadata = isPackageMetadata(local);
          const runtime = supplemental ? !/(?:\.d\.(?:ts|mts|cts)|\.map)$/.test(local) && !/^(?:test|tests|__tests__|docs|examples|coverage)(?:\/|$)/i.test(local) : knownFiles.has(sourcePath);
          return metadata || runtime;
        } });
        if (++restored % 20 === 0 || restored === packages.length) console.log(`Verified runtime packages: ${restored}/${packages.length}`);
    }
  } else await run(process.execPath, [npm, "ci", "--prefer-offline", "--ignore-scripts", "--legacy-peer-deps", "--no-audit", "--no-fund"], { cwd: directory, env: { ...process.env, npm_config_cache: cache, TEMP: temporary, TMP: temporary }, timeout: 1_800_000, maxBuffer: 1_000_000, windowsHide: true });
  console.log("Authenticated npm install complete; bundling actual exports...");
}
const lockText = await readFile(resolve(directory, "package-lock.json"), "utf8");
const lock = JSON.parse(lockText);
async function readPackageMetadata(filename) {
  if (restoreRuntimeFiles) return readVerifiedMetadata(filename, relative(directory, filename).replaceAll("\\", "/"), expectedRuntimeHashes);
  return readFile(filename, "utf8").catch(error => { if (error.code === "ENOENT") return undefined; throw error; });
}
const output = selectedNames ? JSON.parse(await readFile(outputPath, "utf8")) : {};
const missingLicenseNotices = new Set();
if (selectedNames && Object.values(output).some(bundle => bundle.lockfileSha256 !== hash(lockText))) throw new Error("Targeted rebuild must preserve the existing authenticated lock");
for (const project of selectedProjects) {
  const projectKey = `${project.name}@${project.version}${project.subpath ? `/${project.subpath}` : ""}`;
  const installedName = installName(project);
  let importMappings = project.imports
    ? Object.fromEntries(project.imports.map(([specifier, names], index) => [specifier, Object.fromEntries(names.map(name => [name, `Subpath${index}_${name === "*" ? "Namespace" : name}`]))]))
    : project.helpers ? Object.fromEntries(Object.entries(project.helpers).map(([path, names]) => [`${project.name}@${project.version}/${path}`, Object.fromEntries(names.map(name => [name, name]))])) : undefined;
  if (project.stylesheets?.length) importMappings = { ...importMappings, ...Object.fromEntries(project.stylesheets.map(path => [`${project.name}@${project.version}/${path}`, {}])) };
  const names = project.wrappers?.map(value => "Wa" + value.split("-").map(part => part[0].toUpperCase() + part.slice(1)).join(""));
  const implementationEntry = project.imports
    ? project.imports.map(([specifier, names]) => {
      const match = specifier.match(/^(@[^/]+\/[^@/]+|[^@/]+)@([^/]+)(.*)$/);
      if (!match) throw new Error("Expected an exact package pin: " + specifier);
      const importedProject = projects.find(item => item.name === match[1] && item.version === match[2]);
      const target = JSON.stringify((importedProject ? installName(importedProject) : match[1]) + match[3]);
      const named = names.filter(name => name !== "*");
      return [named.length ? `export { ${named.map(name => `${name} as ${importMappings[specifier][name]}`).join(", ")} } from ${target};` : "", names.includes("*") ? `export * as ${importMappings[specifier]["*"]} from ${target};` : ""].join("\n");
    }).join("\n")
    : project.wrappers
      ? [...project.wrappers.map((path, index) => `export { default as ${names[index]} } from "${installedName}/dist/react/${path}/index.js";`), ...Object.entries(project.helpers ?? {}).map(([path, exports]) => `export { ${exports.join(", ")} } from "${installedName}/${path}";`)].join("\n")
      : `export ${project.exports === "*" ? "*" : `{ ${project.exports} }`} from ${JSON.stringify(installedName + (project.subpath ? `/${project.subpath}` : ""))};`;
  const entry = [implementationEntry, ...(project.stylesheets ?? []).map(path => `import ${JSON.stringify(`${installedName}/${path}`)};`)].join("\n");
  const result = await build({
    absWorkingDir: root,
    stdin: { contents: entry, resolveDir: directory, loader: "js" },
    outfile: resolve(directory, "bundle.js"),
    bundle: true, write: false, format: "esm", platform: "browser", target: "es2019", minifyIdentifiers: true, minifySyntax: true, minifyWhitespace: false, legalComments: "inline", metafile: true,
    loader: { ".woff2": "dataurl", ".woff": "dataurl", ".ttf": "dataurl" },
    define: { "process.env.NODE_ENV": '"production"' },
    external: ["react", "react/*", "react-dom", "react-dom/*"],
    logLevel: "silent",
  });
  const javascript = result.outputFiles.find(file => file.path.endsWith(".js"));
  if (!javascript) throw new Error(`Missing JavaScript output for ${project.name}`);
  let code = (await transform(javascript.text, { format: "iife", globalName: "ColLibraryExports", target: "es2019", minifyIdentifiers: true, minifySyntax: true, minifyWhitespace: false, legalComments: "inline" })).code;
  const styles = result.outputFiles.filter(file => file.path.endsWith(".css")).map(file => file.text).join("\n");
  // Original package CSS and font bytes remain inside the authenticated graph.
  // Prepend so the requested application styles retain their normal precedence.
  if (styles) code += `\nconst colPackageStyles = document.createElement("style");\ncolPackageStyles.textContent = ${JSON.stringify(styles)};\ndocument.head.prepend(colPackageStyles);\n`;
  if (!code.includes("ColLibraryExports")) throw new Error(`Empty package bundle: ${project.name}`);
  const externals = [...new Set(Object.values(result.metafile.outputs).flatMap(value => value.imports.filter(item => item.external).map(item => item.path)))].sort();
  if (externals.some(name => !/^react(?:-dom)?(?:\/|$)/.test(name))) throw new Error(`Unexpected external package in ${project.name}: ${externals.join(", ")}`);
  const packages = new Set();
  const emittedPackages = new Set();
  const emittedFiles = new Set(Object.values(result.metafile.outputs).flatMap(output => Object.entries(output.inputs).filter(([, input]) => input.bytesInOutput > 0).map(([path]) => path)));
  for (const path of Object.keys(result.metafile.inputs)) {
    if (path === "<stdin>") continue;
    const absolute = resolve(root, path);
    let folder = dirname(absolute);
    while (folder.startsWith(directory)) {
      const metadata = await readPackageMetadata(resolve(folder, "package.json"));
      if (metadata) { const pkg = JSON.parse(metadata); if (pkg.name && pkg.version) { packages.add(folder); if (emittedFiles.has(path)) emittedPackages.add(folder); break; } }
      const parent = dirname(folder);
      if (parent === folder) break;
      folder = parent;
    }
  }
  const licenses = [];
  const emittedPackageIdentities = [];
  for (const folder of [...packages].sort()) {
    const pkg = JSON.parse(await readPackageMetadata(resolve(folder, "package.json")));
    if (emittedPackages.has(folder)) emittedPackageIdentities.push({ package: pkg.name, version: pkg.version });
    const files = (await readdir(folder)).filter(name => /^(?:licen[cs]e|copying|notice)(?:\.|$)/i.test(name) || /^readme(?:\.|$)/i.test(name));
    for (const name of files) {
      const text = await readPackageMetadata(resolve(folder, name));
      if (/^readme(?:\.|$)/i.test(name) && !text?.includes("Permission is hereby granted") && !(pkg.name === "gsap" && text?.includes("gsap.com/standard-license"))) continue;
      if (text) licenses.push({ package: pkg.name, version: pkg.version, file: name, text });
    }
    if (emittedPackages.has(folder) && !licenses.some(notice => notice.package === pkg.name && notice.version === pkg.version)) {
      const notice = upstreamNotices[`${pkg.name}@${pkg.version}`];
      if (!notice || notice.integrity !== `sha256:${hash(notice.text)}` || !/^https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[a-f\d]{40}\//.test(notice.url)) {
        missingLicenseNotices.add(`${pkg.name}@${pkg.version}`);
        continue;
      }
      licenses.push({ package: pkg.name, version: pkg.version, file: notice.file ?? "LICENSE (upstream)", text: notice.text, source: { url: notice.url, integrity: notice.integrity } });
      code += `\n/*! ${pkg.name}@${pkg.version}\n${notice.text.replaceAll("*/", "* /")}\n*/\n`;
    }
  }
  const sourceFiles = await Promise.all(Object.keys(result.metafile.inputs).filter(path => path !== "<stdin>").sort().map(async path => {
    const absolute = resolve(root, path);
    const sourcePath = relative(directory, absolute).replaceAll("\\", "/");
    if (isAbsolute(sourcePath) || sourcePath === ".." || sourcePath.startsWith("../")) throw new Error(`Bundle escaped its exact locked package graph: ${path}`);
    const bytes = await readFile(absolute);
    return { path: sourcePath, sha256: restoreRuntimeFiles ? authenticateRuntimeFile(bytes, sourcePath, expectedRuntimeHashes) : hash(bytes) };
  }));
  const npmIntegrity = lock.packages[`node_modules/${installedName}`]?.integrity;
  if (!npmIntegrity) throw new Error(`Missing verified tarball integrity for ${project.name}@${project.version}`);
  output[projectKey] = {
    code, externals, exports: Object.entries(result.metafile.outputs).find(([path]) => path.endsWith(".js"))[1].exports, ...(importMappings ? { importMappings } : {}),
    source: { package: project.name, version: project.version, url: `https://registry.npmjs.org/${project.name}/-/${project.name.split("/").at(-1)}-${project.version}.tgz`, integrity: `sha256:${hash(code)}`, npmIntegrity, files: sourceFiles },
    licenses, emittedPackages: emittedPackageIdentities, warnings: result.warnings.map(warning => warning.text), lockfileSha256: hash(lockText),
  };
  console.log(`Bundled ${project.name}@${project.version}: ${code.length} characters; externals ${externals.join(", ")}; ${licenses.length} license files.`);
}
if (missingLicenseNotices.size) throw new Error(`Missing authenticated upstream license notices: ${[...missingLicenseNotices].sort().join(", ")}`);
await mkdir(dirname(lockPath), { recursive: true });
await writeFile(lockPath, lockText);
await writeFile(outputPath, JSON.stringify(output));
