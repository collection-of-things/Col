> During this review stack, rebuild scripts and preview artifacts arrive in the final integration stage.

SolidUI is pinned to `stefan-karger/solid-ui@21ba4fa59b775a8bf9ee8249883de34aba1cf807`. `sources.json` retains the official MIT source, original Geist font bytes and their SIL license. `corpus.json` supplies readable evidence separately from website metadata.

Rebuild from the repository root:

```sh
npm ci --prefix data/solid-libraries/solid-ui --ignore-scripts --legacy-peer-deps
node scripts/solid-libraries/solid-ui.mjs
```

The upstream docs stylesheet uses Tailwind 4 with `@kobalte/tailwindcss@0.9.0`, whose declared peer range still names Tailwind 3. The isolated install retains this upstream combination; the preview compiles the original plugin and stylesheet. The runtime remains the docs' exact Solid 1.9.3 and Kobalte 0.13.7 versions.

Coverage follows all 55 documented component pages, using the official demos at the pinned revision. Previews share grouped code and a compiled original stylesheet; the exact source and dependency inputs remain recorded per component. The build writes the complete artifact to `solid-ui-packed.json` as Brotli-compressed, base64-encoded JSON; the original tracked `solid-ui.json` remains intact. Sidebar uses a memory router to supply its required route context. Its original preference-cookie write is blocked by the opaque sandbox. The progress and avatar demos reference personal images without verified redistribution permission; their upstream fallbacks remain available. The permitted Aspect Ratio photograph is delivered as a quality-90 WebP at its original dimensions; `assets.json` records its attribution, original and delivered hashes and sizes, and conversion. `coverage.json` records each page and its preview status.

Preview verification uses the public `render_component` HTML path and exercises the original component in light and dark themes. Source, stylesheet, package, image and bundle hashes are recorded independently. Layout and pixel equality across every browser and host are not implied.

`build-evidence.json` records each preview's source and group, plus each group's code, CSS, lock, input-graph and package-graph hashes. Group input indices and package keys point to deduplicated records in the same file; the package records match the committed lockfile.
