SolidUI is pinned to `stefan-karger/solid-ui@21ba4fa59b775a8bf9ee8249883de34aba1cf807`. `sources.json` retains the official MIT source, original Geist font bytes and their SIL license. `corpus.json` supplies readable evidence separately from website metadata.

Rebuild from the repository root:

```sh
npm ci --prefix data/solid-libraries/solid-ui --ignore-scripts --legacy-peer-deps
node scripts/solid-libraries/solid-ui.mjs
```

The upstream docs stylesheet uses Tailwind 4 with `@kobalte/tailwindcss@0.9.0`, whose declared peer range still names Tailwind 3. The isolated install retains this upstream combination; the preview compiles the original plugin and stylesheet. The runtime remains the docs' exact Solid 1.9.3 and Kobalte 0.13.7 versions.

Coverage is Button, Accordion and Progress Circle, with original demo compositions. The progress demo's remote personal avatar is not redistributed; its upstream EK fallback remains available offline. `coverage.json` inventories the official documentation navigation and distinguishes selected previews from unindexed components.

Verification exercised every emitted module, all six Button variants, Accordion expansion and collapse, the 75% SVG ring geometry, dark-theme selection, root disposal and source/package hashes. These DOM checks do not establish layout or pixel equality. Browser checks should inspect the 40px default button height, 6px corners, original focus ring, rotating accordion chevrons, 64px progress rings and light/dark colors.
