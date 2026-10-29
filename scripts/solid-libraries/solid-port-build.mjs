import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSolidPreview } from "../solid-preview-build.mjs";
import { authenticateRuntimeFile, restoreArchive, resolveNpmCli } from "../preview-package-archive.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const digest = bytes => createHash("sha256").update(bytes).digest("hex");

/** Rebuild a pinned copy-and-paste registry without importing its documentation app. */
export async function buildSolidPort(slug) {
  const resolveDir = resolve(root, "data/solid-libraries", slug);
  const readJson = async name => JSON.parse(await readFile(resolve(resolveDir, name), "utf8"));
  const source = await readJson("sources.json");
  const config = await readJson("preview.json");
  const manifest = await readJson("package.json");
  const lock = await readJson("package-lock.json");
  const require = createRequire(resolve(resolveDir, "package.json"));
  const { compile, optimize } = require("@tailwindcss/node");
  const { Scanner } = require("@tailwindcss/oxide");
  const sourceRoot = resolve(resolveDir, "node_modules/.cache/col-source");
  const sources = [];
  for (const [path, item] of Object.entries(source.files)) {
    const bytes = item.base64 ? Buffer.from(item.base64, "base64") : Buffer.from(item.content);
    if (item.integrity !== `sha256:${digest(bytes)}`) throw new Error(`Changed upstream source: ${slug}/${path}`);
    const filename = resolve(sourceRoot, path);
    const child = relative(sourceRoot, filename).replaceAll("\\", "/");
    if (child === ".." || child.startsWith("../") || isAbsolute(child)) throw new Error("Source path escaped source root");
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, bytes);
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
    await writeFile(resolve(sourceRoot, "src/registry/kobalte/styles/style-vega.css"), sections.map(match => match[0]).join("\n"));
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
  for (const example of config.examples) {
    const entry = resolve(sourceRoot, `${example.name.replaceAll(" ", "-")}.tsx`);
    const demo = relative(sourceRoot, resolve(sourceRoot, example.path)).replaceAll("\\", "/");
    await writeFile(entry, `import { render } from "solid-js/web";\nimport Demo from "./${demo}";\nexport default function mount(target: HTMLElement) {\n  const html = target.ownerDocument.documentElement;\n  const previousTheme = html.getAttribute("data-kb-theme");\n  const hadStyle = html.classList.contains("style-vega");\n  html.setAttribute("data-kb-theme", typeof PREVIEW_THEME === "undefined" ? (html.classList.contains("dark") ? "dark" : "light") : PREVIEW_THEME);\n  ${slug === "zaidan" ? 'html.classList.add("style-vega"); const previousSlot = target.getAttribute("data-slot"); target.setAttribute("data-slot", "docs");' : ""}\n  const dispose = render(() => <Demo />, target);\n  return () => { dispose(); if (previousTheme === null) html.removeAttribute("data-kb-theme"); else html.setAttribute("data-kb-theme", previousTheme); ${slug === "zaidan" ? 'if (!hadStyle) html.classList.remove("style-vega"); if (previousSlot === null) target.removeAttribute("data-slot"); else target.setAttribute("data-slot", previousSlot);' : ""} };\n}\n`);
    const compiled = await buildSolidPreview({ entry, resolveDir, sourceRoot, aliases: { [config.alias]: resolve(sourceRoot, config.sourceBase) }, css, runtime: "solid1" });
    const id = `${slug}/${example.name}`;
    const code = sourceNotice + compiled.code;
    entries[id] = { code, css: compiled.css, package: slug, version: source.revision, runtimeVersion: manifest.dependencies["solid-js"], exportName: example.exportName, source: { url: source.files[example.path].url, revision: source.revision, integrity: source.files[example.path].integrity }, gaps: example.gaps ?? [] };
    proof[id] = { codeIntegrity: `sha256:${digest(code)}`, cssIntegrity: `sha256:${digest(compiled.css)}`, inputs: compiled.inputs, packages: compiled.packages, lockIntegrity: `sha256:${compiled.lockIntegrity}` };
    notices.push(...compiled.notices.map(({ url, text }) => ({ url, text })));
  }
  const uniqueNotices = [...new Map(notices.map(notice => [notice.url + digest(notice.text), notice])).values()];
  const output = { entries, sources, notices: uniqueNotices };
  await mkdir(resolve(root, "data/component-previews/solid"), { recursive: true });
  await writeFile(resolve(root, `data/component-previews/solid/${slug}.json`), JSON.stringify(output) + "\n");
  await writeFile(resolve(resolveDir, "build-evidence.json"), JSON.stringify({ entries: proof, cssPackages: Object.fromEntries([...cssPackages].map(path => [path, lock.packages[path]])), stylesheet: config.stylesheet, adaptations: config.adaptations }, null, 2) + "\n");
  console.log(`${slug}: built ${Object.keys(entries).length} genuine Solid previews; ${Buffer.byteLength(css)} CSS bytes`);
}
