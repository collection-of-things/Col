import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, constants } from "node:zlib";
import { buildSolidPreview } from "../solid-preview-build.mjs";
import { authenticateRuntimeFile, restoreArchive, resolveNpmCli } from "../preview-package-archive.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const exampleIntroduction = "Original documented SolidJS example from the pinned source. Dependencies and registry helpers listed in this component record cover the selected example; consult the official page for other variants.";

/** Replace oversized generated examples with links to their complete, pinned source. */
export async function refreshPortCorpus(slug) {
  const directory = resolve(root, "data/solid-libraries", slug);
  const readJson = async name => JSON.parse(await readFile(resolve(directory, name), "utf8"));
  const [corpus, source, config] = await Promise.all([readJson("corpus.json"), readJson("sources.json"), readJson("preview.json")]);
  let changed = 0;
  for (const example of config.examples) {
    const file = source.files[example.path];
    if (!file?.content || file.content.length <= 12000) continue;
    if (file.integrity !== `sha256:${digest(file.content)}`) throw new Error(`Changed upstream example: ${slug}/${example.name}`);
    const snapshot = corpus.snapshots.find(item => item.componentId === `${slug}/${example.name}`);
    if (!snapshot?.content.startsWith(exampleIntroduction)) continue;
    if (!snapshot.sources?.some(item => item.url === file.url && item.integrity === file.integrity)) throw new Error(`Missing example source: ${slug}/${example.name}`);
    const suffixStart = snapshot.content.indexOf("\n\nOriginal component source:");
    const suffix = suffixStart < 0 ? "" : snapshot.content.slice(suffixStart);
    const content = `${exampleIntroduction}\n\nThe example is too long to include in full. [View the complete pinned example](${file.url}).${suffix}`;
    if (snapshot.content !== content) { snapshot.content = content; changed++; }
  }
  if (changed) await writeFile(resolve(directory, "corpus.json"), JSON.stringify(corpus, null, 2) + "\n");
  return changed;
}

/** Rebuild a pinned copy-and-paste registry without importing its documentation app. */
export async function buildSolidPort(slug) {
  const resolveDir = resolve(root, "data/solid-libraries", slug);
  const readJson = async name => JSON.parse(await readFile(resolve(resolveDir, name), "utf8"));
  const source = await readJson("sources.json");
  const config = await readJson("preview.json");
  const { assets } = await readJson("assets.json").catch(error => {
    if (error.code === "ENOENT") return { assets: {} };
    throw error;
  });
  const manifest = await readJson("package.json");
  const lock = await readJson("package-lock.json");
  const licenseFallbacks = Object.fromEntries(Object.entries(config.licenseFallbacks ?? {}).map(([key, value]) => {
    const notice = source.files[value.path];
    if (!notice?.content) throw new Error(`Missing recorded license for ${key}`);
    return [key, { url: notice.url, integrity: notice.integrity, license: value.license, text: notice.content }];
  }));
  const require = createRequire(resolve(resolveDir, "package.json"));
  const { compile, optimize } = require("@tailwindcss/node");
  const { Scanner } = require("@tailwindcss/oxide");
  const sourceRoot = resolve(resolveDir, "node_modules/.cache/col-source");
  const sources = [];
  for (const [url, asset] of Object.entries(assets)) {
    const bytes = Buffer.from(asset.dataUrl.split(",")[1], "base64");
    if (asset.url !== url || bytes.length !== asset.bytes || digest(bytes) !== asset.sha256 || !asset.dataUrl.startsWith(`data:${asset.mediaType};base64,`)) throw new Error(`Changed original asset: ${url}`);
  }
  for (const [path, item] of Object.entries(source.files)) {
    const bytes = item.base64 ? Buffer.from(item.base64, "base64") : Buffer.from(item.content);
    if (item.integrity !== `sha256:${digest(bytes)}`) throw new Error(`Changed upstream source: ${slug}/${path}`);
    const filename = resolve(sourceRoot, path);
    const child = relative(sourceRoot, filename).replaceAll("\\", "/");
    if (child === ".." || child.startsWith("../") || isAbsolute(child)) throw new Error("Source path escaped source root");
    await mkdir(dirname(filename), { recursive: true });
    const content = item.base64 ? bytes : Object.entries(assets).reduce((text, [url, asset]) => text.replaceAll(url, asset.dataUrl), item.content);
    await writeFile(filename, content);
    sources.push({ url: item.url, integrity: item.integrity });
  }
  let cssSource = source.files[config.stylesheet].content;
  const cssInputs = new Set();
  const notices = Object.entries(source.files).filter(([path]) => /(?:^|\/)(?:LICENSE|OFL)(?:\.|$)/i.test(path)).map(([, item]) => ({ url: item.url, text: item.content }));

  if (slug === "zaidan") {
    // cn is the registry's unchanged class helper. Other exports initialize the docs server.
    const utils = source.files["src/lib/utils.ts"].content;
    const cn = utils.match(/export function cn\([\s\S]*?\n\}/)?.[0];
    if (!cn) throw new Error("Upstream cn helper changed");
    await writeFile(resolve(sourceRoot, "src/lib/utils.ts"), `import { type ClassValue, clsx } from "clsx";\nimport { twMerge } from "tailwind-merge";\n${cn}\n`);
    // Keep the original Vega theme and docs/body font contexts; other presets are not selected.
    cssSource = cssSource.replace(/^@import "(?:\.\/styles\/[^\"]+|\.\/registry\/kobalte\/styles\/typeset\.css|@fontsource[^\"]+)";\r?\n/gm, "");
    cssSource = cssSource.replace(/\s*\.style-(?!vega\b)[a-z]+\s*\{\s*@import "[^\"]+";\s*\}/g, "");
    const vega = source.files["src/registry/kobalte/styles/style-vega.css"].content;
    const sections = [...vega.matchAll(/\/\* MARK: ([^*]+) \*\/[\s\S]*?(?=\/\* MARK: |$)/g)].filter(match => config.styleSections.includes(match[1]));
    if (sections.length !== config.styleSections.length) throw new Error("Upstream Vega style sections changed");
    let selectedStyles = sections.map(match => match[0]).join("\n");
    const keyframes = [...selectedStyles.matchAll(/@keyframes\s+z-calendar-[\w-]+\s*\{(?:[^{}]|\{[^{}]*\})*\}/g)].map(match => match[0]);
    if (config.styleSections.includes("Calendar") && keyframes.length !== 6) throw new Error("Upstream calendar keyframes changed");
    for (const keyframe of keyframes) selectedStyles = selectedStyles.replace(keyframe, "");
    cssSource += "\n" + keyframes.join("\n");
    await writeFile(resolve(sourceRoot, "src/registry/kobalte/styles/style-vega.css"), selectedStyles);
    const docsFont = source.files["src/styles/typeset.css"].content.match(/\[data-slot="docs"\]\s*\{[^}]+\}/)?.[0];
    if (!docsFont) throw new Error("Original docs font context missing");
    cssSource += `\n@layer components { ${docsFont} }\n`;
    for (const family of ["inter", "geist"]) {
      const fontPath = require.resolve(`@fontsource-variable/${family}`);
      cssInputs.add(fontPath);
      const fontSource = await readFile(fontPath, "utf8");
      let fontCss = [...fontSource.matchAll(/@font-face\s*\{[^}]+\}/g)].map(match => match[0]).filter(rule => rule.includes(`${family}-latin-`)).join("\n");
      if (!fontCss) throw new Error(`Original ${family} Latin font face missing`);
      const fontUrls = [...fontCss.matchAll(/url\(([^)]+)\)/g)];
      for (const match of fontUrls) {
        const file = resolve(dirname(fontPath), match[1].replace(/["']/g, ""));
        cssInputs.add(file);
        fontCss = fontCss.replace(match[0], `url("data:font/woff2;base64,${(await readFile(file)).toString("base64")}")`);
      }
      cssSource += "\n" + fontCss;
    }
  } else {
    cssSource = cssSource.replace(/url\("\/fonts\/([^\"]+)"\)/g, (_, filename) => {
      const font = source.files[`apps/docs/public/fonts/${decodeURIComponent(filename)}`];
      if (!font?.base64) throw new Error(`Missing original font: ${filename}`);
      return `url("data:font/woff2;base64,${font.base64}")`;
    });
  }

  const compiler = await compile(cssSource, {
    base: dirname(resolve(sourceRoot, config.stylesheet)),
    onDependency: path => cssInputs.add(path),
    shouldRewriteUrls: false,
  });
  const candidates = new Scanner({}).scanFiles(Object.entries(source.files)
    .filter(([path]) => /\.[jt]sx?$/.test(path) && (!config.candidateFiles || config.candidateFiles.includes(path)))
    .map(([, item]) => ({ content: item.content, extension: "tsx" })));
  const css = optimize(compiler.build(candidates), { minify: true }).code;
  if (/@(?:apply|import|plugin)\b/.test(css) || /url\((?!["']?data:)/.test(css)) throw new Error("Unresolved preview stylesheet input");

  // CSS packages and font bytes are authenticated against the same npm lock as runtime code.
  const { Parser } = createRequire(resolveNpmCli())("tar");
  const cssPackages = new Set();
  for (const filename of cssInputs) {
    const path = relative(resolveDir, filename).replaceAll("\\", "/");
    if (!path.startsWith("node_modules/") || path.startsWith("node_modules/.cache/")) continue;
    let owner = dirname(path).replaceAll("\\", "/");
    while (!lock.packages[owner] && owner !== ".") owner = dirname(owner).replaceAll("\\", "/");
    if (!lock.packages[owner]) throw new Error(`Unowned CSS dependency: ${path}`);
    cssPackages.add(owner);
  }
  const hashes = new Map();
  const archiveRoot = resolve(resolveDir, "node_modules/.cache/col-archives");
  await mkdir(archiveRoot, { recursive: true });
  for (const path of cssPackages) {
    const pkg = lock.packages[path];
    const cached = resolve(archiveRoot, digest(pkg.integrity) + ".tgz");
    let bytes = await readFile(cached).catch(error => { if (error.code !== "ENOENT") throw error; });
    if (!bytes) {
      const response = await fetch(pkg.resolved, { signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`Cannot authenticate CSS package ${path}: ${response.status}`);
      bytes = Buffer.from(await response.arrayBuffer());
      await writeFile(cached, bytes);
    }
    restoreArchive({ bytes, integrity: pkg.integrity, installRoot: resolveDir, packagePath: path, Parser, allowFile: () => true, verifiedFiles: new Set(), expectedHashes: hashes, restoreFile: () => false });
    const licenses = [...hashes.keys()].filter(file => file.startsWith(path + "/") && /^(?:licen[cs]e|ofl)(?:\.[^/]*)?$/i.test(relative(path, file)));
    if (!licenses.length) throw new Error(`Missing CSS license: ${path}`);
    for (const license of licenses) {
      const bytes = await readFile(resolve(resolveDir, license));
      authenticateRuntimeFile(bytes, license, hashes);
      notices.push({ url: pkg.resolved, text: bytes.toString("utf8") });
    }
  }
  for (const filename of cssInputs) {
    const path = relative(resolveDir, filename).replaceAll("\\", "/");
    if (path.startsWith("node_modules/") && !path.startsWith("node_modules/.cache/")) authenticateRuntimeFile(await readFile(filename), path, hashes);
  }

  const sourceNotice = "/*!\n" + notices.map(notice => `${notice.url}\n${notice.text}`).join("\n\n").replaceAll("*/", "* /") + "\n*/\n";
  const entries = {};
  const proof = {};
  const proofGroups = {};
  const groups = {};
  const styles = { main: css };
  const builds = new Map();
  for (const example of config.examples) {
    const key = example.group ?? `direct:${example.name}`;
    if (!builds.has(key)) builds.set(key, []);
    builds.get(key).push(example);
  }
  for (const [key, examples] of builds) {
    const entry = resolve(sourceRoot, `col-${key.replaceAll(/[^a-zA-Z0-9_-]/g, "-")}.tsx`);
    let imports = examples.map((example, index) => {
      const demo = relative(sourceRoot, resolve(sourceRoot, example.path)).replaceAll("\\", "/");
      return `import Demo${index} from "./${demo}";`;
    }).join("\n");
    const routed = examples.filter(example => example.wrapper === "memory-router");
    if (routed.length) imports += '\nimport { MemoryRouter, Route } from "@solidjs/router";';
    const colorMode = examples.filter(example => example.wrapper === "color-mode");
    if (colorMode.length) imports += '\nimport { ColorModeProvider } from "./src/registry/kobalte/components/color-mode";';
    const selection = examples[0].group
      ? `const Demo = {${examples.map((example, index) => `${JSON.stringify(`${slug}/${example.name}`)}: Demo${index}`).join(",")}}[PREVIEW_COMPONENT];\n  if (!Demo) throw new Error("Unsupported preview component");`
      : "const Demo = Demo0;";
    if (routed.length && colorMode.length) throw new Error("A preview group cannot mix router and color-mode wrappers");
    const renderDemo = routed.length
      ? `const Routed = () => <MemoryRouter><Route path="/*" component={Demo} /></MemoryRouter>;\n  const Preview = ${routed.map(example => `PREVIEW_COMPONENT === ${JSON.stringify(`${slug}/${example.name}`)}`).join(" || ")} ? Routed : Demo;`
      : colorMode.length
        ? `const Themed = () => <ColorModeProvider initialColorMode={typeof PREVIEW_THEME === "undefined" ? (html.classList.contains("dark") ? "dark" : "light") : PREVIEW_THEME}><Demo /></ColorModeProvider>;\n  const Preview = ${colorMode.map(example => `PREVIEW_COMPONENT === ${JSON.stringify(`${slug}/${example.name}`)}`).join(" || ")} ? Themed : Demo;`
        : "";
    await writeFile(entry, `import { render } from "solid-js/web";\n${imports}\nexport default function mount(target: HTMLElement) {\n  ${selection}\n  ${renderDemo}\n  const html = target.ownerDocument.documentElement;\n  const previousTheme = html.getAttribute("data-kb-theme");\n  const hadStyle = html.classList.contains("style-vega");\n  html.setAttribute("data-kb-theme", typeof PREVIEW_THEME === "undefined" ? (html.classList.contains("dark") ? "dark" : "light") : PREVIEW_THEME);\n  ${slug === "zaidan" ? 'html.classList.add("style-vega"); const previousSlot = target.getAttribute("data-slot"); target.setAttribute("data-slot", "docs");' : ""}\n  const dispose = render(() => <${routed.length || colorMode.length ? "Preview" : "Demo"} />, target);\n  return () => { dispose(); if (previousTheme === null) html.removeAttribute("data-kb-theme"); else html.setAttribute("data-kb-theme", previousTheme); ${slug === "zaidan" ? 'if (!hadStyle) html.classList.remove("style-vega"); if (previousSlot === null) target.removeAttribute("data-slot", previousSlot);' : ""} };\n}\n`);
    const compiled = await buildSolidPreview({ entry, resolveDir, sourceRoot, aliases: { [config.alias]: resolve(sourceRoot, config.sourceBase) }, css, runtime: "solid1", licenseFallbacks });
    const code = sourceNotice + compiled.code;
    if (compiled.css !== css) styles[key] = compiled.css;
    groups[key] = { code, style: compiled.css === css ? "main" : key };
    proofGroups[key] = { codeIntegrity: `sha256:${digest(code)}`, cssIntegrity: `sha256:${digest(compiled.css)}`, inputs: compiled.inputs, packages: compiled.packages, inputsIntegrity: `sha256:${digest(JSON.stringify(compiled.inputs))}`, packagesIntegrity: `sha256:${digest(JSON.stringify(compiled.packages))}`, lockIntegrity: `sha256:${compiled.lockIntegrity}` };
    for (const example of examples) {
      const id = `${slug}/${example.name}`;
      const demoAssets = (example.assets ?? []).map(url => {
        if (!assets[url]) throw new Error(`Missing original asset: ${url}`);
        const { dataUrl: _dataUrl, ...provenance } = assets[url];
        return provenance;
      });
      const exampleSource = { url: source.files[example.path].url, revision: source.revision, integrity: source.files[example.path].integrity };
      entries[id] = { group: key, package: slug, version: source.revision, runtimeVersion: manifest.dependencies["solid-js"], exportName: example.exportName, source: exampleSource, ...(demoAssets.length ? { assets: demoAssets } : {}), gaps: example.gaps ?? [] };
      proof[id] = { group: key, source: exampleSource };
    }
    notices.push(...compiled.notices.map(({ url, text }) => ({ url, text })));
  }
  const uniqueNotices = [...new Map(notices.map(notice => [notice.url + digest(notice.text), notice])).values()];
  const output = { entries, ...(Object.keys(groups).length ? { groups, styles } : {}), sources, notices: uniqueNotices };
  // Groups share thousands of authenticated inputs, notably the icon package.
  // Record each hash and package once while retaining every group's full membership.
  const inputEvidence = [];
  const inputIndex = new Map();
  const packageEvidence = {};
  for (const group of Object.values(proofGroups)) {
    group.inputs = group.inputs.map(input => {
      const key = JSON.stringify(input);
      if (!inputIndex.has(key)) {
        inputIndex.set(key, inputEvidence.length);
        inputEvidence.push(input);
      }
      return inputIndex.get(key);
    });
    const packages = Object.entries(group.packages);
    for (const [path, item] of packages) {
      if (packageEvidence[path] && JSON.stringify(packageEvidence[path]) !== JSON.stringify(item)) throw new Error(`Inconsistent package evidence: ${path}`);
      packageEvidence[path] = item;
    }
    group.packages = packages.map(([path]) => path);
  }
  await mkdir(resolve(root, "data/component-previews/solid"), { recursive: true });
  // Keep the retained baseline artifacts; the complete catalog is packed losslessly.
  const original = JSON.stringify(output) + "\n";
  let content = original;
  const assetReferences = [];
  for (const [url, asset] of Object.entries(assets)) {
    const marker = `__COL_ORIGINAL_ASSET_${asset.sha256}__`;
    if (original.includes(marker)) throw new Error(`Original preview contains asset marker: ${url}`);
    if (!content.includes(asset.dataUrl)) continue;
    content = content.replaceAll(asset.dataUrl, marker);
    assetReferences.push({ url, sha256: asset.sha256 });
  }
  const compressed = brotliCompressSync(Buffer.from(content), { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } });
  await writeFile(resolve(root, `data/component-previews/solid/${slug}-packed.json`), JSON.stringify({ encoding: "br", data: compressed.toString("base64"), ...(assetReferences.length ? { assetReferences } : {}) }) + "\n");
  await writeFile(resolve(resolveDir, "build-evidence.json"), JSON.stringify({ entries: proof, groups: proofGroups, inputs: inputEvidence, packages: packageEvidence, cssPackages: Object.fromEntries([...cssPackages].map(path => [path, lock.packages[path]])), stylesheet: config.stylesheet, adaptations: config.adaptations }, null, 2) + "\n");
  await refreshPortCorpus(slug);
  console.log(`${slug}: built ${Object.keys(entries).length} genuine Solid previews; ${Buffer.byteLength(css)} CSS bytes`);
}
