# MagicUI Solid source preview

Verified 2026-10-30 against `axuj/magicui-solid` revision `3100c2f704620f96dc431dd86f86bbbf9bb05965` (2026-08-12).

Marquee, Ripple Button and Shimmer Button use the real Solid port and its official demo modules. CSS is compiled from the port's global stylesheet, using the exact Starlight Black theme inherited by the published demos. Its `data-theme` dark selector is connected to the preview's selected theme. Tailwind 4.3.3 compiles the original utility classes and keyframes; the exact published Geist Sans font and fallback metrics are bundled with its OFL notice. This does not use React Magic UI code as a substitute.

Original avatar bytes are retained in `upstream.json` with source URLs and SHA-256 hashes. Their MIME types are checked against their bytes: these avatar URLs return PNG images. Only their transport changes to data URLs so the isolated preview does not make network requests.

Each emitted entry's `assets` array exposes compact provenance only for the images and font actually embedded in that preview: original/download/resolved URLs, SHA-256, byte count, MIME type and license attribution. The builder derives it from the emitted code/CSS and authenticated source bytes.

The Starlight theme sources are authenticated against their published npm tarball SRI. The original avatar generator’s pinned Vercel MIT notice is retained.

The port explicitly declares MIT licensing in its README, but the LICENSE file linked there is absent at this revision. That limitation is recorded in each preview. The original Magic UI MIT copyright and permission notice is also retained at its immutable license revision, along with all bundled dependency notices.

`catalog.json` contains website metadata; `corpus.json` contains bounded component documentation and a source-pinned official installation snapshot. The library documentation link points to the verified installation guide. The readable `upstream.json`, exact dependency lock and `build.json` retain source and emitted-byte provenance.

To rebuild from the repository root in PowerShell:

```powershell
node scripts/solid-libraries/magicui-solid.mjs
```

The builder restores the committed source inputs and runs a clean `npm ci --ignore-scripts` against its isolated lock before compiling. `build.json` records that authentication boundary, CSS compiler versions and loaded-file hashes, source-package integrity and emitted CSS/code hashes.

Browser checks covered both themes; live marquee transform progression and hover pause; all original avatars and exact font loading; click-positioned Ripple Button waves (`#ADD8E6`) and removal after 600ms; Shimmer Button's 100px radius, 3-second shimmer and 6-second rotation; and disposal. The website demo URLs are recorded per component in the catalog.
