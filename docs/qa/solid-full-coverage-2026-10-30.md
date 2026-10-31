# Solid component coverage verification — 30 October 2026

This expands the ten libraries added in [issue #69](https://git.cafe/collection-of-devs/col/issues/69). Their catalogs, coverage records, pinned sources, licenses, rebuild commands, and individual reproduction gaps are under `data/solid-libraries/<slug>/`. The website uses the existing catalog presentation; the preview bundles retain each library's component and demonstration styles.

| Library | Documented component IDs | Available previews | Unavailable |
| --- | ---: | ---: | ---: |
| Kobalte | 46 | 46 | 0 |
| SolidUI | 55 | 55 | 0 |
| shadcn-solid | 48 | 48 | 0 |
| Zaidan | 58 | 58 | 0 |
| hope-ui | 10 | 10 | 0 |
| RockSolid | 26 | 26 | 0 |
| Nikala UI | 78 | 78 | 0 |
| TorchUI | 99 | 99 | 0 |
| MagicUI Solid | 76 | 76 | 0 |
| Mystic UI | 27 | 27 | 0 |
| **Total** | **523** | **523** | **0** |

TorchUI's navigation has 100 rows but uses the name Table Panel for both a component and a recipe. The single catalog ID points to the component; its `variants` link identifies the separate recipe. TorchUI's Table View preview renders the underlying DataTable shown on its official page, with a disclosure that the TableView wrapper itself is not yet implemented. MagicUI Solid Tweet Card uses clearly labeled sample content in the original card.

## Preview follow-up — 31 October 2026

- TorchUI's current repository head is the pinned revision `2bd057316175457ff1e5103b961867cf388bf73f`, and the latest published `@torch-ui/solid` remains 0.6.20. Its integrity-checked npm archive has no TableView in its JavaScript or type declarations. The live [documentation script](https://torch-ui.dev/assets/index-D5n5m-XK.js) matches the retained SHA-256 and still says the wrapper is not available; its separate DataTable example is not a TableView implementation.
- The [original Tweet Card source](https://github.com/axuj/magicui-solid/blob/3100c2f704620f96dc431dd86f86bbbf9bb05965/src/registry/magicui/client-tweet-card.tsx) fetches live post data and inserts text with `innerHTML`. Col mounts its original `MagicTweet` export with fixed sample content, a generated avatar and the licensed Backlight video excerpt. The sample avoids fetching or redistributing the live post; the component source, stylesheet, frame sandbox and CSP remain unchanged. Loading/error states and in-frame external links are not reproduced.

## Boundaries

- Kobalte is headless and its previews use the official demonstration CSS. Its I18n Provider has no official visual example; its preview composes the documented provider and locale hook and states that adaptation. Image and Hover Card omit the separately hosted GitHub avatar because its redistribution permission is unverified; Image retains its original fallback.
- TorchUI Skeleton and User Card retain their own initials fallbacks because one documented avatar returns HTML and the other has no verified redistribution permission.
- TorchUI's original three-column Board is wrapped in a keyboard-accessible horizontal scroll region on narrow screens. The component's layout and styling are unchanged.
- hope-ui uses the pinned unpublished Solid 2 beta source. Other libraries use their own pinned Solid runtimes and dependencies.
- SolidUI and shadcn-solid Sidebars render and toggle, but their original cookie persistence is blocked by the opaque sandbox. Nikala's Sidebar has the same limitation. Zaidan Dialog retains the upstream Cancel accessible name and portalled Save form ownership.
- Mystic UI previews use the upstream Tailwind variant; its website displays Panda stories. Some external profile images and posters cannot be redistributed, so their source URLs remain blocked and the affected previews disclose the missing assets.
- MagicUI Solid Backlight uses a two-second, 720p/30 fps licensed excerpt: 43,852,026 bytes original, 392,139 bytes delivered. TorchUI Video uses a 10.083-second, 640×268/24 fps licensed excerpt: 90,190,341 bytes original, 152,632 bytes delivered. Both retain source and delivered SHA-256 hashes and conversion details in their asset records. MCP Apps reads these through bounded resources; standalone HTML embeds the same verified bytes within the 2 MB inline budget.
- MagicUI Solid Video Text reuses the unchanged 722,190-byte original WebM already retained by Col. The matching CodePen upload and its current user-content grant are recorded in `data/solid-libraries/magicui-solid/ocean-permission.json`; uploader authority is warranted by CodePen's terms, but the filmmaker and terms in force at upload were not independently identified.
- MagicUI Solid's Lens and Pixel Image examples use WebP conversions: 398,795 to 128,990 bytes and 900,059 to 121,382 bytes, respectively. TorchUI's photo changes from 12,854 to 8,790 bytes; a 20,538-byte frame from the licensed film replaces its 89,072-byte poster to avoid logos excluded from the Spring website's CC BY license. Original and delivered hashes, attribution, and conversions are recorded in each asset manifest.
- SolidUI's photo changes from 93,607 to 38,630 bytes in WebP. Zaidan's gradient avatar changes from 4,086 to 350 bytes losslessly; its three photos change from 112,379 to 93,800 bytes, 90,328 to 63,180 bytes, and 99,240 to 81,138 bytes. The photos retain their recorded source attribution and disclose their lossy conversions.
- Kobalte's repository logo changes losslessly from 8,373 to 3,198 bytes; its decoded RGBA pixels are unchanged.
- Browser checks cover the pinned examples and stated interactions, not every variant, browser engine, assistive technology, or downstream application's installed dependencies. The local MCP Apps host is a protocol fixture, not a third-party client.

## Verification

- The prior 521 available previews passed Chromium checks in light and dark themes. The added Table View DataTable example also passed both themes at desktop and mobile widths, with its exact documented rows, columns, stylesheet and limitation checked. The final Kobalte sweep exercised each recorded interaction and verified both Image fallbacks after its delay.
- Each previously available preview passed through the local MCP Apps protocol host; Kobalte, hope-ui, RockSolid, and Video Text were checked in both themes. The rebuilt TorchUI group passed 42/42 MCP Apps and 84/84 desktop/mobile standalone checks, including Board keyboard scrolling. After the poster substitution, Video passed both themes in MCP Apps and desktop/mobile standalone HTML with frame network access blocked; its frame decoded, disclosure appeared, and video played. The sample Tweet Card passed the same formats, themes and network restriction; its video played and the complete card fit the frame. The two video excerpts played through verified resource reads and standalone HTML; Video Text played its unchanged WebM in both formats.
- `npm run typecheck` passed. `npm test` built the combined git.cafe-base checkout and passed all 427 tests with no skips; its explicit test paths exclude the retained upstream TorchUI setup fixture from Col's test discovery. The isolated checkout used a temporary Turbopack root to resolve linked dependencies; the committed configuration was unchanged. An earlier root-checkout run passed 422 tests, although Turbopack could not persist its cache because that cache disk was full.
- After lossless baseline packing, `npm test` passed all 428 tests without skips on the project's required Node 24.22.1, including the production build and TypeScript check. The isolated checkout again used a temporary Turbopack root; the committed configuration was unchanged.
- A shared asset URL is resolved from the owning component's manifest. Focused tests confirm the React Magic UI Lens retains its original image while the Solid port uses its disclosed conversion. The affected `tailwind-merge` release uses its authenticated npm entry from an already-allowed CDN. React Lens uses the original, locally bundled Motion release and retains its original mask and radius; in Chromium, Escape can reopen the magnifier while the pointer stays over it.
- The React recovery bundle passed all 66 Magic UI light/dark MCP Apps checks, including Lens, Border Beam and Magic Card; Lens also passed four standalone desktop/mobile theme checks. Cult UI Texture Card passed in both themes. The ten additional Cult UI previews previously blocked by esm.sh now use their pinned Radix packages in a shared, authenticated dependency graph; they passed 20 MCP Apps and 40 standalone desktop/mobile theme checks with the direct Radix CDN package endpoints deliberately blocked. Each check verifies the active theme, original stylesheet, available images and one demo interaction; the four canvas demos also have visible, nonzero-sized canvases. The texture demo additionally verifies its selected background decodes and its rendered opacity changes.
- The ten retained baseline artifacts are losslessly Brotli-packed. Their decoded SHA-256 hashes and the resulting preview registry match the original artifacts; component code and styles are unchanged.
- The work is submitted as a stack of pull requests. Earlier source snapshots are inactive until the final integration, and each pull request is measured against its target branch. Merge in order and retarget each follow-up to `main` after its predecessor merges.
