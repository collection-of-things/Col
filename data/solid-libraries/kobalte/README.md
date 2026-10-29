# Kobalte previews

Button, Dialog, and Tabs use the original Kobalte documentation demos and CSS modules at the revision recorded in `sources.json`. Kobalte itself is unstyled. The original SolidBase theme and Inter font are retained; `coverage.json` records the larger documentation inventory and the three supported examples.

Rebuild from the repository root with Node 24:

```sh
npm ci --prefix data/solid-libraries/kobalte --ignore-scripts --no-audit --no-fund
node scripts/solid-libraries/kobalte.mjs
```

The builder verifies source hashes and authenticates every bundled npm file and license against the locked official package archive. Website metadata and permission-gated component documentation are separate.
