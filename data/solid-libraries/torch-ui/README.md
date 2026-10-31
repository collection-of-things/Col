# TorchUI preview sources

The verified project is `sean-dowd-sr/torch-ui`, package `@torch-ui/solid` 0.6.20. Previews pin Solid 1.9.11, its Babel preset 1.9.10, Kobalte 0.13.11, Tailwind 4.2.1, Chart.js 4.5.1, and Lucide Solid 1.64.0 where used.

The official navigation contains 100 rows for 99 distinct names. The previews use original component sources and published demonstrations. The Table Panel recipe is a separate DataTable/ViewSwitcher composition linked as a variant of the documented Table Panel name; the canonical preview shows the basic TablePanel component. The Table View preview reproduces the official page's underlying DataTable example. The TableView wrapper itself is not yet available upstream, and the preview discloses that limitation.

The upstream theme, orange primary token, surface and ink scales, radii, icons, portal styling, and keyframe injection remain intact. Examples that omit application state or fixture data supply only the glue needed to run them; the exact documented snippets and captured live documentation script are in the corpus and provenance records. Accordion defaults to single selection without collapsing the selected item.

Runnable examples adapt a few documentation snippets to match the live demos or correct interaction and accessibility problems; each affected preview discloses its adaptation. The preserved upstream date pickers and charts retain their date-comparison and cleanup limitations.

The original three-column Board is inside a keyboard-accessible horizontal scroll region on narrow screens; its component styling and column layout are unchanged.

The Image photograph is a quality-85 WebP conversion (12,854 to 8,790 bytes, still 600 × 400). A 20,538-byte frame from the licensed Spring film replaces the documented 89,072-byte poster to avoid the Blender and Spring logos excluded from the Spring website's CC BY license. Spring plays a 10.083-second excerpt at 640 × 268 and the original 24 fps with stereo audio (152,632 bytes versus 90,190,341 bytes for the 1920 × 804 original). The shorter clip is stream-copied from the original conversion without further re-encoding. The excerpt ends early; MCP Apps loads it through bounded resource reads, while standalone HTML embeds the same verified bytes. `media.json` records original and delivered hashes, licensing, and the conversion command.

The documentation's Inter font stack and exact Latin font bytes are bundled locally with the OFL notice. Run `node scripts/solid-libraries/torch-ui.mjs` from the repository root to rebuild. The production compiler defines the Vite `import.meta.env.DEV` flag used by upstream Button. Source inputs, package archives, and runtime licenses are authenticated during bundling. `scripts/verify-torch-ui-browser.mjs` runs an opt-in light/dark browser sweep using local Playwright and Chrome installations.

`catalog.json` holds metadata; `corpus.json` holds readable source evidence. MIT and third-party notices accompany the browser code.

The three original previews remain in a losslessly packed baseline artifact. Rebuilds verify their recorded code, CSS, and lock hashes from `baseline-build-manifest.json` and `baseline-package-lock.json` and generate the separate grouped expansion artifact as lossless Brotli-compressed JSON.

The Skeleton documentation references `/avatar.jpg`, which returns HTML rather than an image; the User Card portrait exists on the documentation site, but its redistribution license could not be verified. Both previews omit those URLs and use TorchUI’s original initials fallback.
