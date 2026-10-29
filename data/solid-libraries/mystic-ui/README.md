# Mystic UI source preview

Verified 2026-10-30 against `TheComputerM/mystic-ui` revision `c7b3f1e9150c0474d8a5e62f807c8312e0e4b17f`. The latest repository commit at verification is dated 2024-12-24. The official site describes the project as alpha.

Marquee, Orbiting Circles and Ripple use the genuine Solid **Tailwind variant** and its corresponding story modules. Tailwind 3.4.19 compiles the original classes and each component's registry animation configuration. Solid 1.9.17 and `babel-preset-solid` 1.9.16 are isolated from Col's runtime. Original avatars and the Solid logo are retained byte-for-byte, with correct MIME types and source hashes, and are inlined for the sandbox. MIT and dependency notices accompany each module.

The official website renders Panda examples even on Tailwind documentation pages: its pinned `website/src/components/docs/story-preview.tsx` explicitly imports only Panda stories. Therefore a pixel comparison with that website is not a comparison with the Tailwind implementation. Both official documentation variants are indexed, while this preview and its corpus explicitly identify Tailwind.

The original Tailwind examples do not supply a complete application theme or a reduced-motion override. Ripple also references an undefined `--foreground` token for its border color, and Marquee references the unconfigured `background` color in a dark gradient. Those upstream omissions are disclosed; no alternate theme or invented styling is supplied. Col's neutral preview host supplies its normal text/canvas defaults.

`catalog.json` contains website metadata; `corpus.json` contains component-scoped API and readable example evidence, plus source-pinned official Tailwind/Panda setup guidance. Original inputs, asset integrity, the dependency lock and emitted build provenance are retained beside them.

Each emitted entry's `assets` array exposes compact provenance only for the images actually embedded in that preview: original/download/resolved URLs, SHA-256, byte count, MIME type and license attribution. The Solid logo retains the demo's original URL while its download/resolved URLs identify the verified immutable revision. The builder derives these records from the emitted code/CSS and authenticated source bytes.

To rebuild from the repository root in PowerShell:

```powershell
node scripts/solid-libraries/mystic-ui.mjs
```

The builder restores the committed source inputs and runs a clean `npm ci --ignore-scripts` against its isolated lock before compiling. `build.json` records that authentication boundary, CSS compiler versions and loaded-file hashes, source-package integrity and emitted CSS/code hashes.

Browser checks covered both themes; original image loading; marquee transform progression and hover pause (20/40-second rows); four 20-second orbits with two reverse paths and 80/160px radii; eight ripples, the 210px first circle and dashed final circle; and disposal. The Tailwind and Panda documentation URLs for all three components returned HTTP 200 during source verification.

The Vercel avatar generator’s pinned MIT notice is retained. The Solid logo’s source package declares MIT in its pinned package metadata; that repository has no separate LICENSE file.
