# RockSolid preview sources

The verified project is `darshan-rajadhyaksha/rocksolid`, package `rocksolidjs` 0.1.4. Runtime and compiler are pinned to Solid 1.9.15; Tailwind is 4.3.3.

All 26 documented components have previews. Button uses the original default component with a click counter; Dialog uses the first official documentation composition; Tabs uses the official vertical composition with `dir="rtl"`. The other examples share grouped bundles and use documented source compositions. The source's logical and RTL styles remain intact. Its arrow-key handling remains left/right and does not invert for RTL.

The default theme colors, sizes, corners, shadows, and interaction utilities are unchanged. `theme.css` selects the same `.dark` variant as the official documentation stylesheet, recorded in `styling-evidence.json`, so the chosen preview theme controls those original values.

Live comparisons also verified the documentation's DM Sans font and inherited neutral body text. `docs-context.css` preserves that context, with the exact original Latin font bytes and OFL notice bundled locally.

Run `node scripts/solid-libraries/rocksolid.mjs` from the repository root to rebuild the authenticated, isolated artifact. The frozen source hashes and exact dependency lock are recorded separately from the bounded component evidence in `corpus.json`. MIT notices accompany the delivered code.

The three original previews remain in the unchanged baseline artifact. Rebuilds verify their recorded code, CSS, and lock hashes from `baseline-build-manifest.json` and generate the separate grouped expansion artifact.
