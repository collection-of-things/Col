# Solid 2 and Quoin verification — 2026-10-28

Issue: [#68](https://git.cafe/collection-of-devs/col/issues/68).

## Browser verification follow-up

The user subsequently requested live rendering and interaction testing. This follow-up supersedes the initial implementation's browser-verification limitation below.

The shipped HTML fallback was exercised in Chrome/Chromium 156.0.8078.48 with its real CDN runtime, opaque `allow-scripts allow-forms` iframe, and actual compiled Quoin modules. All **160 cases passed**: 40 families at 1280px and 390px outer viewport widths, each in light and dark mode. Screenshots were captured and visually inspected using contact sheets and individual popup images. Checks covered visible content, runtime errors, document overflow, and opened popup bounds. The final async Form response guard received a further **4/4 passing browser cases**, including editing during submission.

The actual MCP server and shipped MCP Apps SDK/widget were also connected through a local browser test host: **40/40 families rendered**, with no browser errors or widget error reports. A separate Button → open Dialog → Button sequence verified state updates and replacement of an open portal. This is a protocol test host, not a claim of testing Claude, ChatGPT, or another third-party client UI.

| Families | Observable behavior checked |
| --- | --- |
| Accordion, Collapsible | Keyboard expansion and collapse; panel content visibility |
| Alert Dialog, Dialog, Drawer | Opening, focus inside the popup, Tab containment, Escape dismissal, focus restoration |
| Autocomplete, Combobox, Select | Suggestions/options, keyboard or pointer selection, displayed value updates |
| Avatar | Loaded upstream image or real fallback; second fallback avatar |
| Button, Checkbox, Checkbox Group, Switch, Toggle, Toggle Group | Keyboard/pointer state changes; group selection preservation/exclusion |
| CSP Provider | Descendant generated styles disabled; scrolling remains functional |
| Direction Provider, Tabs | Direction-aware arrow focus, explicit Enter activation, selected panel |
| Field, Fieldset, Input | Labeled/editable controls and retained text |
| Form | Simulated rejection, corrected-value resubmission, loading state, stale-response suppression |
| Menu, Menubar | Keyboard submenu opening, item selection, complete menu dismissal, disabled Help menu |
| Context Menu | Right-click opening, item visibility, selection dismissal |
| Navigation Menu | Popup links, viewport containment, Escape dismissal with pointer over trigger |
| Number Field, OTP Field, Slider | Increment/decrement, multi-digit input, keyboard step and range endpoints |
| Meter, Progress, Separator | Semantic values/role, changing progress, visible separator |
| Popover, Preview Card, Tooltip | Popup visibility/position, dismissal where applicable, loaded preview-card image |
| Radio, Radio Group | New selection checks one option and unchecks the previous option |
| Scroll Area | Actual browser wheel scrolling |
| Toast | Visible notification, hover expansion, close-button dismissal |
| Toolbar | Toggle state, font selection, responsive wrapping |

Browser testing found and corrected issues in five shipped compositions:

- Form's static initial value overwrote edits. A signal now retains the URL, clears obsolete errors on edit, and rejects stale simulated responses.
- Menu and Menubar nested selections closed only the nearest submenu. Their composition callbacks now close the parent too.
- Navigation Menu lacked the upstream demo's list reset, overflowed on mobile, and could reopen from hover immediately after Escape. Scoped CSS and the documented cancellable value-change callback fix those cases.
- Toolbar's fixed width overflowed mobile. Its existing controls now wrap within the available width.

Vendor packages and their pinned versions were unchanged. Snapshots and bundles were regenerated and their 627 authenticated package inputs rechecked. Focused regressions first reproduced the Form and menu bugs, then passed after the fixes. The post-fix Quoin DOM suite passed **48/48** checks.

Independent verification also passed 120 MCP tool calls across all 40 families (lookup, Apps result, HTML result), 421 API declaration digests, 40 bundle/example digests, and strict TypeScript compilation of all readable examples. Standards and Spec reviews found no unresolved implementation findings; their stale-documentation finding is corrected in this report.

The final complete `npm test` run passed the Next.js production build and **241/241 tests**, with zero failures, skips, or cancellations. It used the checksum-verified Node 24.22.1 runtime and network access for the existing build-time font downloads. This supersedes the initial 238/239 run and isolated checksum rerun described in the historical section below. Root TypeScript checking also passed.

### Reproducing the browser checks

The opt-in scripts require Playwright and a Chromium executable. Set `PLAYWRIGHT_MODULE` to the installed Playwright module path if it is outside this repository, and `CHROMIUM_EXECUTABLE` when using an installed browser instead of Playwright's bundled Chromium. No browser dependency was added to the application.

```powershell
$env:QUOIN_INTERACTIONS = '1'
node scripts/verify-quoin-browser.mjs
node scripts/verify-quoin-apps-browser.mjs
```

`QUOIN_NAMES` and `QUOIN_PROFILES` optionally select focused cases. `QUOIN_REPORT` optionally names a separate JSON report. Results and screenshots are written under `artifacts/quoin-browser-2026-10-28/`; the run evidence includes `interaction-results.json`, `form-race-results.json`, `apps-results.json`, and `full-test.log`.

The browser matrix used reduced-motion preference, desktop pointer/keyboard input, and responsive widths. It does not establish Firefox/WebKit, touch gestures on physical devices, screen-reader behavior, every prop permutation, SSR/hydration, or a third-party client's CSP and UI integration. External images remain subject to the receiving client's policy. These are limits of the evidence, not hidden passing tests.

## Chain of Verification

The implementation was checked against independent package/source evidence before asserting support.

| Question | Evidence and result |
| --- | --- |
| Is this the package requested by the user? | The jsDelivr link names `quoin-ui`; current npm metadata and the installed authenticated archive identify 0.6.0. The cached jsDelivr page still showed 0.5.0. |
| Which Solid version is actually compatible? | Quoin's published peer dependencies require exactly `2.0.0-rc.18` for `solid-js`, `@solidjs/web`, and `@solidjs/signals`. The newer `next` tag was not substituted. The current source README confirms that no historical beta patches are needed. |
| Does coverage match the real release? | The documentation generator compares the 40 public component/provider subpaths in the installed package against the catalog. Root exports, internals, and package metadata are excluded. Submenu is part of Menu; Toast is included. |
| Can an agent implement components without executing a preview? | Public-tool tests retrieve scoped published API declarations and readable TSX/CSS for all 40 families. Denied/unknown reuse permission and outbound-only entries suppress these snapshots. |
| Are the examples valid Solid code? | All 40 readable examples passed strict TypeScript checking using the installed Solid RC.18 renderer types. The pinned native Solid compiler and esbuild produced closed browser dependency graphs. |
| Are these genuine library implementations? | Bundle generation authenticated 627 input files across seven packages against locked npm archives. Source revisions, original example hashes, bundle hashes, and license notices are retained. Col-authored compositions and styling adaptations are explicitly identified. |
| Do they execute beyond compilation? | All 40 compiled compositions mounted and disposed in JSDOM. Additional behavioral checks exercised Button state updates, Dialog opening/closing and portal cleanup, Select choice updates, and nested Menu keyboard opening and local selection. |
| Is the MCP transport carrying the correct runtime? | An in-memory MCP session verified Solid runtime metadata, request correlation, compiled code in view metadata rather than model text, and the Solid runtime choice in the isolated HTML fallback. |
| Is existing React behavior preserved? | The existing preview tests passed alongside the Solid tests, including source selection, malformed source handling, sandbox isolation, stale-result handling, and provenance. |

## Coverage

All groups have component-scoped API evidence, readable examples, and compiled rendering adapters:

| Group | Public families |
| --- | ---: |
| Controls | 9 |
| Forms and selection | 9 |
| Disclosure and display | 8 |
| Overlays | 6 |
| Menus and navigation, including Menu's submenu composition | 5 |
| Providers | 2 |
| Toast | 1 |
| Total | 40 |

## Initial implementation limits

At the initial implementation stage, no live browser or MCP-client UI testing had been performed. JSDOM has no layout engine; ResizeObserver and media-query shims supported DOM execution only. The browser follow-up above now supplies layout, positioning, visual, and focus evidence within its stated scope.

Original examples with remote images retain their original fallbacks and report potential sandbox restrictions. Navigation Menu destinations are disabled in the example; form submission uses the upstream simulated response. Application data, SSR, hydration, and backend operations are outside the rendering sandbox.

The machine's default Node was below the repository's engine floor. Verification used a checksum-verified Node 24.22.1 executable from the official Node distribution. npm's two high-severity audit findings concern the existing PostCSS and Zod versions, unchanged by this feature; no broad dependency upgrade was mixed into the implementation.

## Initial implementation checks

Typechecking and focused catalog, transport, renderer, and DOM tests passed during implementation.

Independent review found three issues: license notices were not included in delivered modules, example hashes reflected Windows checkout line endings rather than pinned Git blobs, and the vendored Solid notice lacked an LF-preserving Git attribute. All three were fixed and rechecked. The final Standards review and Spec review each reported zero unresolved material findings.

The first full-test command stopped at the production build because sandbox network restrictions blocked the existing Google Fonts downloads. The same command was restarted with network access; no font or application changes were made to bypass the failure.

The network-enabled `npm test` completed the production build and ran 239 tests: 238 passed and one existing supplemental-bundle checksum test failed. Its unchanged lockfile's committed bytes matched the recorded digest, while the Windows CRLF checkout did not. A narrow LF Git attribute and restoration of the committed bytes corrected the environment issue; the exact failing test then passed on a focused rerun. No application or bundle implementation changed after the full run.

The initial change contained 40 supported Quoin families, a largest new file of 4,640,664 bytes, and less than 10 MB of changed file content. At that stage, the full run was not repeated after the isolated line-ending fix. The follow-up includes a new complete build/test run.
