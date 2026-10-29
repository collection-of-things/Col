import { resolve } from "node:path";
import { openSourceBuild, tailwind4, emitPreviews } from "./source-build.mjs";

const build = await openSourceBuild("magicui-solid");
const postcss = build.require("postcss");
// The official demos inherit this theme; registry installation defaults differ.
const theme = build.upstream.files["theme-black/styles/theme.css"].content;
const base = postcss.parse(build.upstream.files["theme-black/styles/base.css"].content);
const baseTheme = postcss.atRule({ name: "layer", params: "black" });
base.walkRules(rule => { if (rule.selector === ":root") baseTheme.append(rule.clone()); });
const site = postcss.parse(build.upstream.files["docs/common.css"].content);
const typography = postcss.root();
site.walkRules(rule => {
  if (rule.selector.split(",").includes(":root") && rule.nodes.some(node => node.prop === "--sl-line-height")) typography.append(rule.clone());
  if (rule.selector === "body" && rule.nodes.some(node => node.prop === "font-family" && node.value === "var(--__sl-font)")) typography.append(rule.clone());
});
let fontCss = [...build.upstream.files["docs/ripple-button.html"].content.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(match => match[1]).find(css => css.includes("--font-geist:"));
if (!fontCss || typography.nodes.length !== 2 || baseTheme.nodes.length !== 1) throw new Error("The upstream demo typography or theme shape changed");
for (const [url, asset] of Object.entries(build.upstream.assets)) if (asset.mediaType === "font/woff2") fontCss = fontCss.replaceAll(new URL(url).pathname, asset.dataUrl);
const upstreamCss = build.upstream.files["src/styles/global.css"].content.replace("@import 'tailwindcss/utilities.css' layer(utilities);", "@import 'tailwindcss/utilities.css' layer(utilities) source(none);");
const css = await tailwind4(build, `${upstreamCss}\n${fontCss}\n${theme}\n${baseTheme}\n@layer starlight{${typography}}\n@source "./source/src/registry/magicui";\n@source "./source/src/demos";`);
const selected = [
  { name: "Marquee", slug: "marquee", exportName: "MarqueeDemo", componentExport: "Marquee" },
  { name: "Ripple Button", slug: "ripple-button", exportName: "RippleButtonDemo", componentExport: "RippleButton" },
  { name: "Shimmer Button", slug: "shimmer-button", exportName: "ShimmerButtonDemo", componentExport: "ShimmerButton" },
];
await emitPreviews(build, {
  examples: selected.map(item => ({ ...item, module: `./src/demos/${item.exportName}.tsx`, source: `src/registry/magicui/${item.slug}.tsx` })),
  css, packageName: "magicui-solid", aliases: { "@": resolve(build.sourceRoot, "src") },
  themeSetup: 'document.documentElement.dataset.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";',
  notices: [
    { url: build.upstream.files["README.md"].url, text: "MagicUI Solid — axuj. The pinned upstream README states: Licensed under the MIT License. Source: " + build.upstream.repository + ". The linked LICENSE file is absent at the pinned revision; no upstream copyright notice was supplied." },
    { url: build.upstream.files["licenses/original-magic-ui-LICENSE.md"].url, text: "Original Magic UI, credited by the Solid port:\n" + build.upstream.files["licenses/original-magic-ui-LICENSE.md"].content },
    { url: build.upstream.files["theme-black/LICENSE.md"].url, text: build.upstream.files["theme-black/LICENSE.md"].content },
    { url: build.upstream.files["licenses/geist-OFL.txt"].url, text: build.upstream.files["licenses/geist-OFL.txt"].content },
    { url: build.upstream.files["starlight/LICENSE"].url, text: build.upstream.files["starlight/LICENSE"].content },
    { url: build.upstream.files["licenses/vercel-avatar-LICENSE"].url, text: build.upstream.files["licenses/vercel-avatar-LICENSE"].content },
  ],
  gaps: ["Upstream declares MIT in README; its linked LICENSE file is absent at this revision."],
});
