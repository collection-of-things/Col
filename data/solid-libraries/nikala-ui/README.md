# Nikala UI source preview

Verified 2026-10-30 against `nikala-ui/ui` revision `ce75abc6a948d2d78b2b22d368c2997832d0909b`.

- The Button, Toggle Group and Timeline are the upstream components. Each mount uses the literal `defaultCode` example in its official documentation source.
- CSS comes from `apps/web/src/app.css`, compiled with Tailwind 4.3.3. The original yellow OKLCH tokens, dark theme, radii, type scale and system font stack are retained.
- Solid 1.9.17 and `babel-preset-solid` 1.9.16 are isolated from Col's own runtime. MIT notices and locked dependency licenses are present in every module.
- The examples use browser APIs. Native Tauri v2 windows, updater and operating-system integrations are not emulated.

`catalog.json` is website metadata. `corpus.json` contains component-scoped, readable API/example evidence. `upstream.json` contains authenticated original inputs; `build.json` records emitted hashes, used packages and lock integrity. The copy of upstream source is inert JSON so Col's TypeScript configuration does not compile vendored files.

To rebuild from the repository root in PowerShell:

```powershell
node scripts/solid-libraries/nikala-ui.mjs
```

The builder restores the committed source inputs and runs a clean `npm ci --ignore-scripts` against its isolated lock before compiling. `build.json` records that authentication boundary, CSS compiler versions and loaded-file hashes, source-package integrity and emitted CSS/code hashes.

Browser verification covered both themes, Button focus/Enter, Toggle Group click and Space selection (`role=radio`, `aria-checked`), all four Timeline events, and Solid disposal. The upstream Button computes to 36px height and 6px radius; its primary colors are `oklch(0.795 0.184 86.047)` in light mode and `oklch(0.852 0.199 91.936)` in dark mode. No Col component styling is substituted.
