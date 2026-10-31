# hope-ui preview sources

The verified `hope-ui/hope-ui` revision in `provenance.json` is the current, unpublished Solid 2 preview. It is not the older `@hope-ui/solid` package. Runtime and Babel preset are pinned to `2.0.0-beta.32` in the isolated dependency lock.

All ten documented components use official documentation demos. The mount entries add the required `ThemeProvider` and `hope` preset. The original preset recipes, Tailwind structure, semantic tokens, icons, transitions, and light/dark values are preserved. Seven examples share a compiled group; Button, Dialog, and Select retain their individual bundles.

Run `node scripts/solid-libraries/hope-ui.mjs` from the repository root to rebuild. The script checks every frozen upstream file against its recorded hash, installs the locked dependency graph into an isolated cache, authenticates runtime package archives, and emits the browser artifact plus `build-manifest.json`.

`catalog.json` contains website metadata; `corpus.json` contains bounded, component-scoped evidence. `upstream/` preserves the required source files unchanged. MIT, Apache-2.0, and upstream notice text accompany the delivered code.

The three original previews remain in a losslessly packed baseline artifact. Rebuilds verify their recorded code, CSS, and lock hashes from `baseline-build-manifest.json` and generate the separate grouped expansion artifact.
