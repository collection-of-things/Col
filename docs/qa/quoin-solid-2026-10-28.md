# Solid 2 and Quoin verification — 2026-10-28

Issue: [#68](https://git.cafe/collection-of-devs/col/issues/68).

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

## Limits

No live browser or MCP-client UI testing was performed. JSDOM has no layout engine; ResizeObserver and media-query shims support DOM execution but do not establish positioning, visual fidelity, browser focus behavior, or assistive-technology compatibility. These limits are disclosed with the previews.

Original examples with remote images retain their original fallbacks and report potential sandbox restrictions. Navigation Menu destinations are disabled in the example; form submission uses the upstream simulated response. Application data, SSR, hydration, and backend operations are outside the rendering sandbox.

The machine's default Node was below the repository's engine floor. Verification used a checksum-verified Node 24.22.1 executable from the official Node distribution. npm's two high-severity audit findings concern the existing PostCSS and Zod versions, unchanged by this feature; no broad dependency upgrade was mixed into the implementation.

## Final checks

Typechecking and focused catalog, transport, renderer, and DOM tests passed during implementation.

Independent review found three issues: license notices were not included in delivered modules, example hashes reflected Windows checkout line endings rather than pinned Git blobs, and the vendored Solid notice lacked an LF-preserving Git attribute. All three were fixed and rechecked. The final Standards review and Spec review each reported zero unresolved material findings.

The first full-test command stopped at the production build because sandbox network restrictions blocked the existing Google Fonts downloads. The same command was restarted with network access; no font or application changes were made to bypass the failure.

The network-enabled `npm test` completed the production build and ran 239 tests: 238 passed and one existing supplemental-bundle checksum test failed. Its unchanged lockfile's committed bytes matched the recorded digest, while the Windows CRLF checkout did not. A narrow LF Git attribute and restoration of the committed bytes corrected the environment issue; the exact failing test then passed on a focused rerun. No application or bundle implementation changed after the full run.

The final change contains 40 supported Quoin families, a largest new file of 4,640,664 bytes, and less than 10 MB of changed file content. No live browser testing was performed. The full run was not repeated after the isolated line-ending fix.
