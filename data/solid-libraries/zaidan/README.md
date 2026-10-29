Zaidan is pinned to `carere/zaidan@271ffce00aaeee0dfa32f2321c9b6e212af39c3d`. `sources.json` retains the official MIT source and attribution for its shadcn-derived utilities. Fontsource's original Geist Variable and Inter Variable Latin font faces and SIL licenses are authenticated against the package lock during the build. `corpus.json` is separate from client catalog metadata.

Rebuild from the repository root:

```sh
npm ci --prefix data/solid-libraries/zaidan --ignore-scripts
node scripts/solid-libraries/zaidan.mjs
```

Coverage is Button, Checkbox and Dialog using the original Kobalte foundation, default Vega style and unchanged official demos. The isolated Solid 1.9.17/Kobalte 0.13.14 graph satisfies the pinned upstream ranges. The wrapper places `style-vega` on the document root so portals inherit the same styling. It retains the original `[data-slot="docs"]` font rule on the mount target: inline components inherit Geist, while portals outside that context inherit the body's Inter font. Both attributes are restored on disposal.

The build compiles unchanged Vega sections for the selected components and their Field/Input/Label/Separator dependencies. It omits unrelated presets, documentation styles and unused calendar rules. It extracts the unchanged `cn` helper from the docs utility module so server-only storage initialization is not bundled. Every adaptation is recorded in `preview.json` and `build-evidence.json`; source bytes stay intact in `sources.json`.

Verification exercised every emitted module, icon rendering, unchecked/default-checked/disabled checkboxes, dialog open/Escape/reopen/disposal, theme mapping and source/package hashes. Browser checks should inspect the 36px outlined button, 8px corners, 3px focus ring, 14px dialog corners, checked indicators, disabled opacity and original light/dark zinc colors. The profile form is a local demonstration with no backend. Other styles and the Corvu foundation are not claimed as previewed. DOM tests do not establish layout or pixel equality.

Chrome 156 comparisons with the live official Dialog page confirmed identical accessibility trees: the visible Cancel and icon Close controls are both named `Dismiss`. They are inside the dialog and remain focusable. The dialog portal sits outside the example's form, so Save changes has no owning form and does not submit. Col preserves these upstream limitations and reports them in the preview and component evidence. Cancel and Escape removed the dialog and overlay and returned focus to Open Dialog in light/dark and reduced-motion checks. The official page and Col both retained the same Inter font, 14px corners and 100ms entrance animation, including when reduced motion was requested.
