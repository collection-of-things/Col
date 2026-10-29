import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { openSourceBuild, tailwind4, emitPreviews } from "./source-build.mjs";

const build = await openSourceBuild("nikala-ui");
const selected = [
  { name: "Button", slug: "button", componentExport: "Button", imports: 'import { Button } from "@/components/ui/button";' },
  { name: "Toggle Group", slug: "toggle-group", componentExport: "ToggleGroup", imports: 'import { createSignal } from "solid-js";\nimport { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";\nimport { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-solid";' },
  { name: "Timeline", slug: "timeline", componentExport: "Timeline", imports: 'import { Timeline, TimelineItem, TimelineSeparator, TimelinePoint, TimelineConnector, TimelineContent, TimelineTitle, TimelineDescription, TimelineTime } from "@/components/ui/timeline";\nimport { Check, CreditCard, Package, Truck } from "lucide-solid";' },
];
const examples = [];
for (const component of selected) {
  const documentation = build.upstream.files[`apps/web/src/routes/docs/components/${component.slug}.tsx`].content;
  const ast = build.require("@babel/core").parseSync(documentation, { babelrc: false, configFile: false, parserOpts: { plugins: ["typescript", "jsx"] } });
  const snippet = ast.program.body.flatMap(node => node.type === "VariableDeclaration" ? node.declarations : []).find(node => node.id.name === "defaultCode")?.init;
  if (snippet?.type !== "TemplateLiteral" || snippet.expressions.length !== 0) throw new Error(`Expected the documented literal defaultCode: ${component.slug}`);
  const code = snippet.quasis[0].value.cooked;
  const body = component.slug === "toggle-group" ? code : `return (${code});`;
  const file = `${component.slug}.demo.tsx`;
  await writeFile(resolve(build.sourceRoot, file), `${component.imports}\nexport default function Demo() {\n${body}\n}\n`);
  examples.push({ name: component.name, exportName: `${component.componentExport}Demo`, componentExport: component.componentExport, defaultExport: true, module: `./${file}`, source: `packages/core/src/registry/components/ui/${component.slug}.tsx` });
}
const theme = build.upstream.files["apps/web/src/app.css"].content;
const css = await tailwind4(build, `${theme.replace('@import "tailwindcss";', '@import "tailwindcss" source(none);')}\n@source "./source/packages/core/src/registry/components/ui";\n@source "./source/*.demo.tsx";`);
await emitPreviews(build, {
  examples, css, packageName: "nikala-ui/ui",
  aliases: { "@/components/ui": resolve(build.sourceRoot, "packages/core/src/registry/components/ui"), "@/hooks": resolve(build.sourceRoot, "packages/hooks/src"), "@/lib": resolve(build.sourceRoot, "packages/core/src/lib") },
  notices: [{ url: build.upstream.files["LICENSE"].url, text: build.upstream.files["LICENSE"].content }],
  gaps: ["Browser UI examples only; native Tauri APIs and desktop integrations are outside this preview."],
});
