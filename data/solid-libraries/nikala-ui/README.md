# Nikala UI source previews

All **78 documented components** are indexed with individual HTTP-200 page verification and authentic runnable previews. Source: `nikala-ui/ui` revision `ce75abc6a948d2d78b2b22d368c2997832d0909b`, checked on 2026-10-30. `coverage.json` lists every exact name and official URL; `page-verification.json` retains the checked page hashes.

The original Button, Toggle Group and Timeline remain compatible direct entries. Other previews share closed modules for ordinary components, highlighting and rich editing. Each dispatcher selects the actual example through the renderer's lexical `PREVIEW_COMPONENT` constant. `demos/*.tsx` are authored extractions of each page's first live `ComponentPreview`, preserving original imports, state and JSX. They are not byte-identical full documentation files; those originals and hashes remain in `upstream.json`. Theme Manager receives the required original ThemeProvider.

The three original preview bytes remain unchanged. `baseline.json` authenticates that artifact and `baseline-package-lock.json`; its direct build records are retained in `build.json`. The additional 75 previews use a lossless Brotli-packed `expanded.json`, decoded by the merged index. Both packed-file and decoded-content hashes are recorded. Packing changes transport size, not browser code or CSS.

Tailwind 4.3.3 compiles the original `apps/web/src/app.css`, preserving yellow OKLCH tokens, dark colors, radii, typography and system fonts. Solid 1.9.17 and babel-preset-solid 1.9.16 are isolated from Col's runtime. Original MIT and authenticated dependency notices accompany the artifacts. Native Tauri integrations are not emulated; the documented examples use browser implementations.

Sidebar updates its open state before unconditionally writing a cookie. The sandbox blocks that write, so toggling works while persistence raises a disclosed SecurityError. Theme Manager's original provider already catches unavailable storage. The upstream Button remains 36px high with a 6px radius and light/dark primary colors `oklch(0.795 0.184 86.047)` / `oklch(0.852 0.199 91.936)`.

The original GitHub profile image has no verified redistribution permission, so its URL remains blocked and the upstream avatar fallback is preserved. Licensed Unsplash demo photos retain their source bytes and attribution.

`catalog.json` is website metadata; `corpus.json` supplies bounded component props, readable examples and official setup links without executable installation commands. Long examples and demos displaying CLI commands point to their pinned source instead. `build.json` records compiler authentication, locked runtime inputs and emitted group/style hashes. `browser-verification.json` records both themes, controls, images, animations and disposal in an opaque sandbox iframe. Shared tests separately cover the actual MCP transport and widget paths.

`dependencies.json` records component and demo-only requirements separately. Public MCP dependencies include their verified union so the selected examples are implementable; the corpus explicitly names extras such as `lucide-solid` for Toggle Group and Timeline. All 78 previews passed in both themes (156 cases).

Rebuild: `npm exec -- node scripts/solid-libraries/nikala-ui.mjs`. A missing isolated environment uses the committed lock with `npm ci --ignore-scripts`. Existing CSS compiler files are checked against prior clean-install hashes; used browser package files are authenticated against locked npm archives. The recorded method distinguishes those routes. No root dependencies are installed.

Opt-in browser sweep: `npm exec -- node scripts/solid-libraries/motion-browser-check.mjs nikala-ui`. Set `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for another browser installation. The harness uses `allow-scripts allow-forms`, blocks external resources and runs sequentially.
