import { resolve } from "node:path";
import { openSourceBuild, recordCssBuild, emitPreviews } from "./source-build.mjs";

const build = await openSourceBuild("mystic-ui");
const selected = [
  { name: "Marquee", slug: "marquee", exportName: "MarqueeDemo", componentExport: "Marquee", gaps: ["The upstream Tailwind Marquee demo references dark:from-background without defining a background theme color; that original omission is retained."] },
  { name: "Orbiting Circles", slug: "orbiting-circles", exportName: "OrbitingCirclesDemo", componentExport: "OrbitingCircles" },
  { name: "Ripple", slug: "ripple", exportName: "RippleDemo", componentExport: "Ripple", gaps: ["The upstream Tailwind Ripple references --foreground without defining it; its original border-color fallback is retained."] },
];
const extend = { animation: {}, keyframes: {} };
for (const item of selected) {
  const registry = JSON.parse(build.upstream.files[`packages/registry/tailwind/${item.slug}.json`].content);
  Object.assign(extend.animation, registry.config.theme.extend.animation);
  Object.assign(extend.keyframes, registry.config.theme.extend.keyframes);
}
const content = selected.flatMap(item => [
  { raw: build.upstream.files[`components/tailwind/src/ui/${item.slug}.tsx`].content, extension: "tsx" },
  { raw: build.upstream.files[`components/tailwind/src/stories/${item.slug}/default.tsx`].content, extension: "tsx" },
]);
const result = await build.require("postcss")([build.require("tailwindcss")({ darkMode: "class", content, theme: { extend }, plugins: [] })]).process(build.upstream.files["components/tailwind/.storybook/tailwind.css"].content, { from: undefined });
await recordCssBuild(build, result.css, [resolve(build.resolveDir, "node_modules/tailwindcss/lib/css/preflight.css")]);
await emitPreviews(build, {
  examples: selected.map(item => ({ ...item, defaultExport: true, module: `./components/tailwind/src/stories/${item.slug}/default.tsx`, source: `components/tailwind/src/ui/${item.slug}.tsx` })),
  css: result.css, packageName: "mystic-ui (Tailwind variant)", aliases: { "@": resolve(build.sourceRoot, "components/tailwind/src") },
  notices: [
    { url: build.upstream.files["LICENSE.md"].url, text: build.upstream.files["LICENSE.md"].content },
    { url: build.upstream.files["licenses/vercel-avatar-LICENSE"].url, text: build.upstream.files["licenses/vercel-avatar-LICENSE"].content },
    { url: build.upstream.files["licenses/solid-site-package.json"].url, text: "Solid logo from solidjs/solid-site. The pinned package.json explicitly declares the MIT license. No separate LICENSE file is present in that repository." },
  ],
  gaps: ["This preview uses the upstream Tailwind 3 variant. Panda CSS is documented separately and is not substituted into this example.", "The upstream Tailwind examples do not define a complete application theme or reduced-motion override."],
});
