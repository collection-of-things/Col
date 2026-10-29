# TorchUI preview sources

The verified project is `sean-dowd-sr/torch-ui`, package `@torch-ui/solid` 0.6.20. Previews pin Solid 1.9.11, its source lock's Babel preset 1.9.10, Kobalte 0.13.11, and Tailwind 4.2.1.

Coverage is partial: Button uses the documented outlined toggle API with a text label; Dialog uses the official basic composition; Accordion uses the official basic styled items and documentation wrapper. The original theme, orange primary token, surface and ink scales, radii, icons, portal styling, and keyframe injection remain intact. Accordion's default is single selection without collapsing the selected item; selecting another item closes the previous one.

Live comparisons verified the documentation's Inter font. `docs-context.css` preserves its original stack and font faces; the exact Latin font bytes and OFL notice are bundled locally so the sandbox needs no font requests.

Run `node scripts/solid-libraries/torch-ui.mjs` from the repository root to rebuild. The production compiler defines the Vite `import.meta.env.DEV` flag used by upstream Button. Source files remain unchanged and are authenticated against `provenance.json`; package archives and runtime licenses are verified during bundling.

`catalog.json` is small website metadata. `corpus.json` provides separate readable evidence. MIT and third-party notices accompany the delivered browser code.
