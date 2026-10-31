# Solid library expansion verification — 30 October 2026

This report accompanies [issue #69](https://git.cafe/collection-of-devs/col/issues/69). All ten libraries have distinct website and MCP records and the selected source-backed examples below. Their `data/solid-libraries/<slug>/coverage.json` inventories distinguish these examples from navigation-derived component links: three per library are indexed and renderable; the inventories are not a claim of exhaustive preview support. Each library's README, source records and lockfile give the pinned revisions and rebuild instructions.

| Library | Solid runtime used for previews | Verified, renderable examples | Documented links inventoried |
| --- | --- | --- | ---: |
| Kobalte | 1.9.17 | Button, Dialog, Tabs | 46 |
| SolidUI | 1.9.3 | Button, Accordion, Progress Circle | 55 |
| shadcn-solid | 1.9.17 | Button, Dialog, Tabs | 48 |
| Zaidan | 1.9.17 | Button, Checkbox, Dialog | 58 |
| hope-ui | 2.0.0-beta.32 | Button, Dialog, Select | 10 |
| RockSolid | 1.9.15 | Button, Dialog, Tabs | 26 |
| Nikala UI | 1.9.17 | Button, Toggle Group, Timeline | 78 |
| TorchUI | 1.9.11 | Button, Dialog, Accordion | 100 |
| MagicUI Solid | 1.9.17 | Marquee, Ripple Button, Shimmer Button | 76 |
| Mystic UI | 1.9.17 | Marquee, Orbiting Circles, Ripple | 27 |

## Checks and independent comparisons

- Final `npm test`: production build and **311 tests passed**, with no failures or skips. `npm run typecheck` and `git diff --check` passed. The focused Solid catalog, integrity, and mount/disposal suites passed **69 tests**. An earlier build encountered Google Fonts timeouts; a later run exposed a discovery-test assumption about source hosts, which was corrected before the final passing run. The build cache was moved to another local workspace drive and linked back after the project drive ran out of space.
- The public MCP seam exercises library and component search, lookups, compatibility, documentation evidence, and both rendering formats for every selected ID. Separate integrity tests check the retained source bytes, dependency locks, CSS, closed module imports, license notices, and disclosed image provenance. Simulated DOM tests mount and dispose all 30 components and exercise their open portals.
- The actual standalone HTML frames passed **120/120** Chrome runs: all 30 examples at desktop and mobile widths in light and dark themes. There were no reported runtime errors, failed image loads, or horizontal overflows in those runs. An additional 18 motion-library runs remained usable with reduced motion requested; this does not claim that upstream animations honor that preference. Kobalte's light and dark frames also accepted an intentional user CSS override.
- A local MCP Apps test host exercised the real in-memory MCP transport, widget, metadata delivery, and frame replacement for all 30 examples in light and dark. This host is a protocol fixture, not a third-party MCP client. MCPJam Inspector was launched separately but required sign-in in the test browser, so no result is claimed for that client.
- On the built website, Chrome exercised SolidJS filtering, searches for all ten names, and all ten detail pages at desktop/mobile widths in both themes. All four profiles passed, with official website/docs links, page structure, and horizontal fit checked.
- In live documentation, representative Kobalte, SolidUI, Zaidan, and Nikala buttons matched the preview's computed text color, background, radius, font family, and font size after fonts loaded. All three Zaidan examples also matched their inline or portal typography. Hope, RockSolid, and TorchUI comparisons sampled eight selected components in both themes, with the exceptions below. MagicUI Solid's Ripple Button was compared against the published docs; Mystic's Tailwind examples were checked against its upstream Tailwind source because its site displays Panda stories.
- The 50 selected library website, documentation, and component links returned successful HTTP responses. The remaining inventory links come from upstream navigation and were not individually fetched or promoted to verified component support.
- Six distinct original avatar PNG snapshots total 23,531 bytes. They remain byte-for-byte originals under the existing preview asset contract, with their sources and hashes disclosed; they were not converted to WebP. The staged Git pack is checked against Col's 10 MB limit before commit.
- Embedded font hashes and licenses are retained in the library provenance. MagicUI Solid also exposes its font in per-preview asset disclosure; the other embedded fonts are not individually listed there, and affected previews disclose that limit.

Independent standards and spec reviews found missing image disclosure, incomplete setup/example evidence, a source-marker error, and lookup snapshots that published install commands. Those findings were corrected and rechecked. The standards reviewer also noted similar archive-authentication loops in the builders; they remain separate because their CSS and source inputs differ, and no further refactor was needed for this issue.

## Verification boundaries and source limitations

- Kobalte is headless: its selected previews include the official demo's CSS, not a Kobalte component theme.
- hope-ui's current preview is source-only: the selected `@hope-ui/components` package was not published to npm at verification time. Its Solid 2 beta graph is kept separate from the Solid 1 graphs and Quoin's Solid 2 release-candidate graph.
- Zaidan's official Dialog labels its visible Cancel control “Dismiss” for assistive technology, and its portalled Save button has no owning form. The preview retains and discloses those upstream behaviors. The documentation's inline controls use Geist, while its dialog portal uses Inter.
- shadcn-solid's published docs had missing-demo registry errors during inspection. The examples here use the pinned upstream source; the current pinned registry index omits the selected Dialog entry.
- RockSolid's direction-sensitive Tabs use the documented RTL composition. Directional key behavior is limited to what the upstream component implements.
- TorchUI's live Dialog trigger matched in light mode, but the live documentation did not open the dialog during comparison; the open-state and dark comparisons remain unverified. The pinned source example opens in Col's local browser tests.
- Nikala's examples are browser UI; native Tauri window, dialog and updater APIs are not emulated.
- The MagicUI Solid repository declares MIT in its README, but its linked LICENSE file was absent at the pinned revision. The declaration and applicable dependency notices are retained.
- Mystic previews use the upstream Tailwind 3 variant; its published pages display Panda stories. The Tailwind examples omit some application theme values and reduced-motion overrides, which are disclosed rather than silently replaced.
- Tests and comparisons cover selected examples and properties, not every upstream variant, operating environment, assistive technology, browser engine, or client.
