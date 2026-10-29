/** Rebuild Kobalte's reviewed official demos with their original CSS modules. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { createHash } from "node:crypto";
import postcss from "postcss";
import { buildSolidPreview } from "../solid-preview-build.mjs";

const project = resolve(import.meta.dirname, "../../data/solid-libraries/kobalte");
const sourceRoot = resolve(project, "node_modules/.cache/col-source");
const snapshots = JSON.parse(await readFile(resolve(project, "sources.json"), "utf8"));
const hash = content => createHash("sha256").update(content).digest("hex");
for (const file of snapshots.files) {
  if (hash(file.content) !== file.integrity) throw new Error(`Source integrity mismatch: ${file.url}`);
  const path = resolve(sourceRoot, file.path);
  if (!path.startsWith(sourceRoot + sep)) throw new Error(`Source path escapes snapshot root: ${file.path}`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, file.content);
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
const catalog = {
  library: { name: "Kobalte", slug: "kobalte", addedAt: "2026-10-30T00:17:02+05:30", description: "Unstyled, accessible SolidJS primitives with composable APIs and data attributes for custom styling.", url: "https://kobalte.dev", category: "Component Library", stacks: ["SolidJS", "Tailwind CSS", "TypeScript"], useCases: ["Dashboards", "Accessibility-first"], tags: ["headless", "unstyled", "primitives"] },
  details: { docsUrl: "https://kobalte.dev/docs/core/overview/introduction", repoUrl: "https://github.com/kobaltedev/kobalte", pricing: { model: "free", summary: "Kobalte is free and open source under the MIT license.", license: "MIT", source: source("LICENSE.md").url } },
  components,
  compatibility: [
    { subject: "solid-js", constraint: "^1.9.8; preview pinned to 1.9.17", status: "supported", evidence: "https://registry.npmjs.org/@kobalte/core/0.13.14" },
    { subject: "tailwindcss", constraint: "v3 uses @kobalte/tailwindcss; v4 uses native data attributes", status: "supported", evidence: "https://kobalte.dev/docs/core/overview/styling" },
  ],
  corpus: { slug: "kobalte", permission: { status: "granted", source: source("LICENSE.md").url, checkedAt: "2026-10-30" }, snapshots: [
    { title: "Kobalte setup and styling", url: "https://kobalte.dev/docs/core/overview/styling", fetchedAt: "2026-10-30", sourceRevision: snapshots.revision, content: "Kobalte supplies unstyled Solid primitives. Use the official getting-started guide and component documentation. Core 0.13.14 requires solid-js ^1.9.8. The Tailwind plugin targets Tailwind v3; v4 supports data-attribute variants directly. The three indexed examples retain official demo CSS, state selectors, theme attributes, and typography; coverage is partial." },
    ...documentation,
  ] },
};
const { corpus, ...metadata } = catalog;
await writeFile(resolve(project, "catalog.json"), JSON.stringify(metadata, null, 2) + "\n");
await writeFile(resolve(project, "corpus.json"), JSON.stringify(corpus, null, 2) + "\n");
await mkdir(resolve(project, "../../component-previews/solid"), { recursive: true });
await writeFile(resolve(project, "../../component-previews/solid/kobalte.json"), JSON.stringify({ entries, sources: snapshots.files.map(({ url, integrity }) => ({ url, integrity })), notices, evidence }) + "\n");
console.log(`Built ${Object.keys(entries).length} Kobalte previews with original CSS, font, and verified dependencies.`);
