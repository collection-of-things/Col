/** Rebuild Kobalte's reviewed official demos with their original CSS modules. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { createHash } from "node:crypto";
import { brotliCompressSync, constants } from "node:zlib";
import postcss from "postcss";
import { parse } from "@babel/parser";
import { buildSolidPreview } from "../solid-preview-build.mjs";

const project = resolve(import.meta.dirname, "../../data/solid-libraries/kobalte");
const sourceRoot = resolve(project, "node_modules/.cache/col-source");
const snapshots = JSON.parse(await readFile(resolve(project, "sources.json"), "utf8"));
const hash = content => createHash("sha256").update(content).digest("hex");
const omittedAvatarFragments = {
  "apps/docs/src/examples/image.tsx": `src="https://avatars.githubusercontent.com/u/124704559?s=200&v=4"`,
  "apps/docs/src/examples/hover-card.tsx": `<img\n\t\t\t\t\t\tsrc="https://avatars.githubusercontent.com/u/124704559?s=200&v=4"\n\t\t\t\t\t\talt="Kobalte"\n\t\t\t\t\t\tclass={style.hovercard__avatar}\n\t\t\t\t\t/>`,
};
for (const file of snapshots.files) {
  if (hash(file.content) !== file.integrity) throw new Error(`Source integrity mismatch: ${file.url}`);
  const path = resolve(sourceRoot, file.path);
  if (!path.startsWith(sourceRoot + sep)) throw new Error(`Source path escapes snapshot root: ${file.path}`);
  await mkdir(dirname(path), { recursive: true });
  let content = file.content;
  const omittedFragment = omittedAvatarFragments[file.path];
  if (omittedFragment) {
    if (content.split(omittedFragment).length !== 2) throw new Error(`Expected one unverified avatar in ${file.path}`);
    content = content.replace(omittedFragment, "");
  }
  for (const [url, asset] of Object.entries(snapshots.assets ?? {})) {
    if (asset.blocked) continue;
    const bytes = Buffer.from(asset.dataUrl.split(",")[1], "base64");
    if (hash(bytes) !== asset.integrity) throw new Error(`Asset integrity mismatch: ${url}`);
    content = content.replaceAll(url, asset.dataUrl);
  }
  await writeFile(path, content);
}
const source = path => {
  const file = snapshots.files.find(file => file.path === path);
  if (!file) throw new Error(`Missing reviewed source: ${path}`);
  return file;
};
const site = postcss.parse(source("site.css").content);
const selected = new Set(["*,:before,:after", "*", "body", "input,button,textarea,select", "html,[data-theme*=light]", "html", "[data-theme*=dark]"]);
const baseCss = site.nodes.filter(node => node.type === "rule" && (selected.has(node.selector) || node.selector.includes("._preview-stage"))).map(node => node.toString()).join("\n");
const stage = site.nodes.find(node => node.type === "rule" && /^\._preview-stage_/.test(node.selector)).selector.slice(1);
const inner = site.nodes.find(node => node.type === "rule" && /^\._preview-stage-inner_/.test(node.selector)).selector.slice(1);
const notices = [source("LICENSE.md"), source("solidbase-LICENSE")].map(file => ({ url: file.url, text: file.content }));
const banner = "/*!\n" + notices.map(notice => notice.text).join("\n\n").replaceAll("*/", "* /") + "\n*/\n";
const entries = {};
const components = [];
const documentation = [];
const evidence = [];
const inventory = JSON.parse(await readFile(resolve(project, "coverage.json"), "utf8"));
for (const [name, summary] of [
  ["Button", "An accessible button with disabled-state behavior and native keyboard activation."],
  ["Dialog", "A modal dialog with focus management, dismissal, and an original styled portal."],
  ["Tabs", "Keyboard-accessible tabs with a moving selection indicator and content panels."],
]) {
  const key = name.toLowerCase();
  const example = source(`apps/docs/src/examples/${key}.tsx`);
  const sheet = source(`apps/docs/src/examples/${key}.module.css`);
  const docs = source(`apps/docs/src/routes/docs/core/(1)components/${key}.mdx`);
  const entry = resolve(sourceRoot, `mount-${key}.tsx`);
  await writeFile(entry, `import { render } from "solid-js/web";
import "@fontsource-variable/inter/wght.css";
import { BasicExample } from "./apps/docs/src/examples/${key}";
export default function mount(target: HTMLElement) {
  document.documentElement.dataset.theme = PREVIEW_THEME;
  return render(() => <div class="${stage}"><div class="${inner}"><BasicExample /></div></div>, target);
}
`);
  console.log(`Building Kobalte ${name}`);
  const built = await buildSolidPreview({ entry, resolveDir: project, sourceRoot, css: baseCss });
  const code = banner + built.code;
  const id = `kobalte/${name}`;
  const url = `https://kobalte.dev/docs/core/components/${key}`;
  const gaps = [
    "Kobalte is headless; this example preserves its official documentation demo and CSS, including the original Inter Latin font.",
    "Only the recorded example is supplied; application routing, backend actions, and other demo variants are not reproduced.",
  ];
  entries[id] = { code, css: built.css, package: "@kobalte/core", version: "0.13.14", runtimeVersion: "1.9.17", exportName: name, source: { url: example.url, revision: snapshots.revision, integrity: example.integrity }, gaps };
  evidence.push({ id, integrity: hash(code), cssIntegrity: hash(built.css), lockIntegrity: built.lockIntegrity, inputs: built.inputs, packages: built.packages });
  for (const notice of built.notices) if (!notices.some(item => item.url === notice.url && item.text === notice.text)) notices.push(notice);
  components.push({ name, url, summary, kind: "primitive", verifiedAt: "2026-10-30", dependencies: ["@kobalte/core", "solid-js"], ...(name === "Dialog" ? { concept: "dialog" } : {}) });
  const sources = [example, sheet, docs].map(({ url, integrity }) => ({ url, integrity }));
  documentation.push({ componentId: id, title: `${name}: official example and styling`, url, fetchedAt: "2026-10-30", sourceRevision: snapshots.revision, sources,
    content: ["Use @kobalte/core 0.13.14 with Solid 1.9.17. The core peer requirement is Solid ^1.9.8. This is the official demo source; import its CSS module alongside it. Kobalte itself ships no default styles.", ...gaps, `\`\`\`tsx\n${example.content}\n\`\`\``, `\`\`\`css\n${sheet.content}\n\`\`\``, source("LICENSE.md").content].join("\n\n") });
  const apiStart = docs.content.indexOf("## API Reference");
  if (apiStart < 0) throw new Error(`Missing API Reference in ${docs.url}`);
  const api = docs.content.slice(apiStart);
  documentation.push({ componentId: id, title: `${name}: official API and accessibility`, url, fetchedAt: "2026-10-30", sourceRevision: snapshots.revision, sources: [{ url: docs.url, integrity: docs.integrity }], content: api + "\n\n" + source("LICENSE.md").content });
}
const remaining = inventory.documentationInventory.filter(component => !components.some(item => item.name === component.name));
const imports = [];
const dispatch = [];
const groupedEntries = [];
for (const [index, component] of remaining.entries()) {
  const key = new URL(component.url).pathname.split("/").filter(Boolean).at(-1);
  const id = `kobalte/${component.name}`;
  const docs = source(`apps/docs/src/routes/docs/core/(1)components/${key}.mdx`);
  const description = docs.content.split("# {frontmatter.title}")[1]?.trim().split(/\n\s*\n/)[0]?.replace(/\s+/g, " ");
  if (!description) throw new Error(`Missing description for ${id}`);
  const apiStart = docs.content.toLowerCase().indexOf("## api reference");
  if (apiStart < 0) throw new Error(`Missing API reference for ${id}`);
  const provider = key === "i18n-provider";
  const example = provider ? docs : source(`apps/docs/src/examples/${key}.tsx`);
  const sheet = provider ? undefined : source(`apps/docs/src/examples/${key}.module.css`);
  if (provider) {
    imports.push('import { I18nProvider, useLocale } from "@kobalte/core/i18n";');
    imports.push('function KobalteLocaleExample() { const value = useLocale(); return <span lang={value.locale()} dir={value.direction()}>{value.locale()} ({value.direction()})</span>; }');
    imports.push('function DemoLocale() { return <I18nProvider locale="fr-FR"><KobalteLocaleExample /></I18nProvider>; }');
    dispatch.push(`${JSON.stringify(id)}: DemoLocale`);
  } else {
    imports.push(`import { BasicExample as Demo${index} } from ${JSON.stringify(`./apps/docs/src/examples/${key}`)};`);
    dispatch.push(`${JSON.stringify(id)}: Demo${index}`);
  }
  const deps = ["@kobalte/core", "solid-js", ...(key === "search" ? ["minisearch"] : []), ...(key === "select" ? ["@tanstack/solid-virtual"] : [])];
  components.push({ name: component.name, url: component.url, summary: description, kind: "primitive", verifiedAt: "2026-10-30", dependencies: deps });
  const sources = [example, sheet, docs].filter(Boolean).map(({ url, integrity }) => ({ url, integrity }));
  let exampleExcerpt = "";
  if (!provider) {
    const ast = parse(example.content, { sourceType: "module", plugins: ["typescript", "jsx"] });
    const demo = ast.program.body.find(node => node.type === "ExportNamedDeclaration" && node.declaration?.type === "FunctionDeclaration" && node.declaration.id?.name === "BasicExample");
    if (!demo) throw new Error(`Missing BasicExample for ${id}`);
    const excerpt = example.content.slice(demo.start, demo.end);
    if (excerpt.length <= 8_000) exampleExcerpt = `\n\nOfficial demo function (its imports and any surrounding data remain in the linked source):\n\`\`\`tsx\n${excerpt}\n\`\`\``;
  }
  documentation.push({ componentId: id, title: `${component.name}: official API and example`, url: component.url, fetchedAt: "2026-10-30", sourceRevision: snapshots.revision, sources,
    content: `Kobalte is unstyled; the preview uses its official demo and CSS module${provider ? ", except that this nonvisual provider is composed with the documented useLocale example" : ""}.${exampleExcerpt}\n\n${docs.content.slice(apiStart, apiStart + 12_000)}` });
  const gaps = [
    provider ? "Kobalte's I18n Provider has no visual demo; this preview composes its documented provider and useLocale examples without adding component styling." : "Kobalte is headless; this example preserves its official documentation demo and CSS, including the original Inter Latin font.",
    "Only the recorded example is supplied; application routing, backend actions, and other demo variants are not reproduced.",
  ];
  if (key === "image" || key === "hover-card") gaps.push(`The original GitHub-hosted avatar is omitted because its redistribution permission is unverified.${key === "image" ? " The component's original fallback remains." : ""}`);
  const assetUrls = key === "navigation-menu" ? ["https://kobalte.dev/android-chrome-192x192.png"] : [];
  const assets = assetUrls.map(url => {
    const asset = snapshots.assets[url];
    return { url, downloadUrl: asset.downloadUrl, resolvedUrl: asset.downloadUrl, sha256: asset.integrity, mediaType: asset.mediaType, bytes: Buffer.from(asset.dataUrl.split(",")[1], "base64").length, attribution: asset.attribution, ...(asset.original ? { original: asset.original, transformation: asset.transformation } : {}) };
  });
  groupedEntries.push({ id, entry: { group: "documented", package: "@kobalte/core", version: "0.13.14", runtimeVersion: "1.9.17", exportName: component.name, source: { url: example.url, revision: snapshots.revision, integrity: example.integrity }, gaps, ...(assets.length ? { assets } : {}) } });
}
const groupedEntry = resolve(sourceRoot, "mount-documented.tsx");
await writeFile(groupedEntry, `import { render } from "solid-js/web";\nimport "@fontsource-variable/inter/wght.css";\n${imports.join("\n")}\nconst demos = { ${dispatch.join(",\n")} };\nexport default function mount(target: HTMLElement) {\n  document.documentElement.dataset.theme = PREVIEW_THEME;\n  const Demo = demos[PREVIEW_COMPONENT as keyof typeof demos];\n  if (!Demo) throw new Error("Unknown Kobalte preview component");\n  return render(() => <div class="${stage}"><div class="${inner}"><Demo /></div></div>, target);\n}\n`);
console.log(`Building ${groupedEntries.length} remaining Kobalte previews`);
const grouped = await buildSolidPreview({ entry: groupedEntry, resolveDir: project, sourceRoot, css: baseCss,
  unusedImports: ["@tanstack/solid-virtual"],
});
const groupCode = banner + grouped.code;
for (const { id, entry } of groupedEntries) entries[id] = entry;
for (const notice of grouped.notices) if (!notices.some(item => item.url === notice.url && item.text === notice.text)) notices.push(notice);
const groupEvidence = { documented: { codeIntegrity: hash(groupCode), cssIntegrity: hash(grouped.css), lockIntegrity: grouped.lockIntegrity, inputs: grouped.inputs, packages: grouped.packages } };
inventory.selectedComponents = inventory.documentationInventory.map(item => item.name);
for (const item of inventory.documentationInventory) { item.preview = "supported"; item.documentation = "source-snapshot"; }
await writeFile(resolve(project, "coverage.json"), JSON.stringify(inventory, null, 2) + "\n");
const catalog = {
  library: { name: "Kobalte", slug: "kobalte", addedAt: "2026-10-30T00:17:02+05:30", description: "Unstyled, accessible SolidJS primitives with composable APIs and data attributes for custom styling.", url: "https://kobalte.dev", category: "Component Library", stacks: ["SolidJS", "Tailwind CSS", "TypeScript"], useCases: ["Dashboards", "Accessibility-first"], tags: ["headless", "unstyled", "primitives"] },
  details: { docsUrl: "https://kobalte.dev/docs/core/overview/introduction", repoUrl: "https://github.com/kobaltedev/kobalte", pricing: { model: "free", summary: "Kobalte is free and open source under the MIT license.", license: "MIT", source: source("LICENSE.md").url } },
  components,
  compatibility: [
    { subject: "solid-js", constraint: "^1.9.8; preview pinned to 1.9.17", status: "supported", evidence: "https://registry.npmjs.org/@kobalte/core/0.13.14" },
    { subject: "tailwindcss", constraint: "v3 uses @kobalte/tailwindcss; v4 uses native data attributes", status: "supported", evidence: "https://kobalte.dev/docs/core/overview/styling" },
  ],
  corpus: { slug: "kobalte", permission: { status: "granted", source: source("LICENSE.md").url, checkedAt: "2026-10-30" }, snapshots: [
    { title: "Kobalte setup and styling", url: "https://kobalte.dev/docs/core/overview/styling", fetchedAt: "2026-10-30", sourceRevision: snapshots.revision, content: "Kobalte supplies unstyled Solid primitives. Use the official getting-started guide and component documentation. Core 0.13.14 requires solid-js ^1.9.8. The Tailwind plugin targets Tailwind v3; v4 supports data-attribute variants directly. Indexed component examples retain official demo CSS, state selectors, theme attributes, and typography." },
    ...documentation,
  ] },
};
const { corpus, ...metadata } = catalog;
await writeFile(resolve(project, "catalog.json"), JSON.stringify(metadata, null, 2) + "\n");
await writeFile(resolve(project, "corpus.json"), JSON.stringify(corpus, null, 2) + "\n");
await mkdir(resolve(project, "../../component-previews/solid"), { recursive: true });
const artifact = JSON.stringify({ entries, groups: { documented: { code: groupCode, style: "documented" } }, styles: { documented: grouped.css }, sources: snapshots.files.map(({ url, integrity }) => ({ url, integrity })), notices, evidence, groupEvidence }) + "\n";
const packed = brotliCompressSync(artifact, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).toString("base64");
await writeFile(resolve(project, "../../component-previews/solid/kobalte-packed.json"), JSON.stringify({ encoding: "br", data: packed }) + "\n");
console.log(`Built ${Object.keys(entries).length} Kobalte previews with original CSS, font, and verified dependencies.`);
