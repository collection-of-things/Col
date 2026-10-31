# Kobalte previews

> During this review stack, rebuild scripts and preview artifacts arrive in the final integration stage.

The documented controls use Kobalte's original demos and CSS modules at the revision recorded in `sources.json`. Kobalte itself is unstyled. The original SolidBase theme and Inter font are retained. The nonvisual I18n Provider has no standalone visual demo, so its preview composes the documented provider and `useLocale` examples. `coverage.json` records the indexed documentation inventory.

Rebuild from the repository root with Node 24:

```sh
npm ci --prefix data/solid-libraries/kobalte --ignore-scripts --no-audit --no-fund
node scripts/solid-libraries/kobalte.mjs
```

The builder verifies source hashes and authenticates every bundled npm file and license against the locked official package archive. It excludes the virtualizer import used only by an unselected Select variant; the build fails if an excluded import survives in the bundle. Website metadata and permission-gated component documentation are separate.

The generated preview artifact is losslessly Brotli-compressed to meet Col's repository size limit; the server restores its exact JSON before serving previews.

The repository logo is a lossless WebP conversion of its original PNG, with unchanged decoded pixels and recorded source and delivered hashes. The separately hosted GitHub profile avatar is omitted from Image and Hover Card because its redistribution permission is unverified; Image retains its original fallback.
