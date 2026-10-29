shadcn-solid is pinned to `hngngn/shadcn-solid@4c75b892148dc81f81167a43756d4ce0fbfe6eae`. It is a separate project from SolidUI. `sources.json` retains the official MIT source, original Geist variable fonts and their SIL license. `corpus.json` supplies readable evidence separately from website metadata.

Rebuild from the repository root:

```sh
npm ci --prefix data/solid-libraries/shadcn-solid --ignore-scripts
node scripts/solid-libraries/shadcn-solid.mjs
```

The pinned registry uses Tailwind 4 and Kobalte. The isolated Solid 1.9.17/Kobalte 0.13.14 graph satisfies its upstream dependency ranges. The wrapper maps Col's selected theme to the original `data-kb-theme` mechanism, including portal content, and restores the attribute on disposal.

Coverage is Button, Dialog and Tabs with unchanged official demos. The account/password forms are local UI examples and do not save account data. The pinned Dialog implementation omits its default close icon unless the caller explicitly supplies `showCloseButton`; its original Escape and overlay dismissal remain intact. `coverage.json` records the wider documentation inventory without claiming exhaustive previews.

Verification exercised every emitted module, dialog open/Escape/reopen/disposal, keyboard selection of Password, original theme/font payloads and source/package hashes. Browser checks should inspect the 36px Button height, 8px corners, 3px focus ring, 10px dialog corners, scrollable content and the Tabs indicator in both themes. DOM tests do not establish layout or pixel equality.
