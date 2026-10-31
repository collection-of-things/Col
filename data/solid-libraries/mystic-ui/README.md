# Mystic UI source previews

> During this review stack, rebuild scripts and preview artifacts arrive in the final integration stage.

All **27 documented components** are individually verified and indexed from `TheComputerM/mystic-ui` revision `c7b3f1e9150c0474d8a5e62f807c8312e0e4b17f`, checked on 2026-10-30. The latest repository commit checked is dated 2024-12-24; the official site calls the project alpha. `coverage.json` lists exact names and URLs; `page-verification.json` records each HTTP-200 page and hash.

Previews use the genuine Solid **Tailwind variant** and original story modules. Tailwind 3.4.19 compiles the original classes and each registry's animation configuration. Solid 1.9.17 and babel-preset-solid 1.9.16 are isolated from Col's runtime. Closed shared modules avoid repeated dependencies; MIT and authenticated package notices accompany the outputs.

All 27 components have runnable previews and passed both themes (54 cases). The original three direct previews remain byte-identical after lossless Brotli unpacking; `baseline.json` authenticates the decoded artifact and its retained lock, and `build.json` retains the direct records. The merged index adds 24 previews from `expanded.json`.

The Tailwind Android story incorrectly imports Panda's generated styled-system. A small authored adapter renders the actual Android export with its original SVG defaults. No replacement artwork or Panda styles are substituted. All other expanded previews use original stories.

The published website imports Panda stories even on Tailwind documentation pages, so a pixel comparison against that website compares different official variants. Both documentation variants are listed; runnable examples and corpus explicitly identify Tailwind. Original omissions remain disclosed: no complete application theme or reduced-motion override, Ripple's undefined `--foreground` and Marquee's unconfigured dark-gradient background. Col supplies only its neutral preview-host text/canvas defaults.

Original avatar PNGs and the Solid logo are retained byte-for-byte with correct MIME types and hashes. Compact `assets` provenance includes only images used by each preview. The logo keeps the demo's original URL with immutable download/resolved URLs. The avatar generator's MIT notice is retained. The Solid site's pinned package metadata declares MIT but has no separate LICENSE file.

`catalog.json` is website metadata. `corpus.json` supplies scoped props, readable examples and source-pinned Tailwind/Panda setup guidance without executable installation commands. `upstream.json` contains original inputs; `build.json` records CSS authentication, locked runtime files and emitted hashes. `browser-verification.json` records both themes, controls, image decoding, motion and disposal; shared tests separately cover MCP delivery.

`dependencies.json` follows each component's own pinned import graph and Tailwind registry metadata, recording story-only requirements separately. Public MCP dependencies include both verified sets; the corpus names story-only additions.

Rebuild: `npm exec -- node scripts/solid-libraries/mystic-ui.mjs`. Missing isolated dependencies use the committed lock with `npm ci --ignore-scripts`; existing CSS compiler files are checked against prior clean-install hashes and runtime files against locked archives. Root dependencies are untouched.

Opt-in browser sweep: `npm exec -- node scripts/solid-libraries/motion-browser-check.mjs mystic-ui`. Set `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for another installation. Original Marquee rows retain 20/40-second durations, Orbiting Circles retain 80/160px radii with reversed outer paths, and Ripple retains eight circles, a 210px first circle and dashed final circle.
