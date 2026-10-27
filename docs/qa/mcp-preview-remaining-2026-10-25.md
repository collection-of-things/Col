# Remaining component client verification

**Historical status at 2026-10-25: incomplete browser repair verification.** The 55 pending IDs were subsequently observed; see the [final reruns and styling verification](mcp-preview-final-reruns-2026-10-26.md). This report preserves the original failures and unverified states rather than rewriting their history.

This follow-up covers the 450 available adapters that were absent from the earlier 86-ID browser sweep. Their union is all 536 available adapters across 22 libraries. Coverage means each example was submitted through MCPJam's tool UI and its rendered result inspected. It does not mean every possible state, every host or every application configuration was tested.

## CoVe method

1. Establish the baseline in MCPJam 3.16.2 with Strict CSP. Verify the displayed component identity before attributing a render result. Record visible errors, actual DOM, media decoding and controls separately.
2. Challenge the proposed diagnosis: distinguish a CDN import failure from component logic, a missing provider/container from an upstream implementation defect, and browser-control failures from failed user interactions.
3. Make narrow repairs using the exact published package, pinned upstream source or unchanged original asset. Retain versions, integrity, notices and explicit reproduction limits.
4. Rerun affected components in the actual client. An element existing is not sufficient proof of a working control: require a visible state change. Media container validation is not playback proof: inspect decoding and time progression in the browser.
5. Independently review source fidelity, CSP/sandbox directives and evidence accounting. Reconcile findings before reporting success.

| Verification question | Evidence used to challenge the claim |
| --- | --- |
| Are these still the library implementations? | Compare all upstream source-file hashes, authenticate npm archives and bundled files, and retain original asset bytes. Only the Hexta composition adds its required original host. |
| Did a real supported client render the result? | Submit through MCPJam, verify the displayed exact component ID, then inspect the nested rendered frame. Server success alone is insufficient. |
| Does a control actually work? | Record its visible before/after state separately. A timeout or unchanged state is unverified, even when mounting succeeded. |
| Was CSP weakened to make it pass? | Compare CSP and sandbox literals with the prior commit, keep MCPJam Strict mode, and retain visible restrictions for external resources. |
| Can every original resource be reproduced? | Check original URL responses, size limits, decoded dimensions and playback progression. Preserve explicit limitations where those checks fail. |

## Confirmed repairs and checks

- Web Awesome's official system icon resolver already contains SVG bytes, but its default loader fetched them and hit `connect-src`. Its supported icon-registry extension now inserts those exact original SVG nodes, retaining attributes, license comments and the original fill mutator. Select opens and chooses Pear; dialog and drawer open and close; original close/chevron artwork renders under Strict CSP.
- Hexta's original toast demo called `toast()` without its required `Toaster`. The adapter now composes that same pinned library export. Space shows the original Event created toast; Undo changes it to Event removed. The component source and stylesheet are unchanged.
- Original images, animations and bounded audio/video are embedded unchanged, with hashes and attribution. No placeholder or substitute media is generated. Video Text's original WebM decoded at 720 pixels wide, was playing, and advanced from 3.363962 to 3.757430 seconds between observations.
- ReUI Number Field increments 5 to 6 and clamps 999 to 100 and -5 to 0 on blur. Unicode/emoji text entry is preserved. Kibo Dialog Stack advances through all three original dialogs and returns through Previous. The original terminal demo switches to its sample test output; no shell command is executed. ElevenLabs Live Waveform changes to processing and scrolling, then returns to idle.
- Package interactions include menus, dialogs, tabs, sliders, text inputs, Ark Editable F2/edit/Enter commit, Mantine MultiSelect's visible Pear chip, and Be UI toast/modal/sheet behavior. Only observed state changes are counted as passes.
- The supplemental registry grows from 11 to 65 package groups, retaining actual published implementations and required shared contexts, including React Aria collections, Tiptap and their declared peers. A second dependency audit found 15 exact CDN modules failing with upstream HTTP 500 responses; their official package versions are bundled too. Streamdown retains its original CSS and KaTeX font bytes. The largest selected bundles are approximately 17.01 MB for Streamdown and 9.43 MB for Shiki; this has a real transport and compilation cost. The complete supplemental manifest is 46,884,570 bytes, while each preview receives only its required groups.
- ElevenLabs Conversation exposed a false syntax rejection in Babel's TypeScript scope analysis of a valid emitted JavaScript dependency graph. Validation now tries strict JavaScript/JSX grammar first, then strict TypeScript/JSX for genuine TypeScript. Both parsers keep error recovery disabled; malformed JSX, missing exports and source-error redaction remain tested. The regression uses the actual Conversation graph through the client compiler pipeline.
- Large Conversation and Kibo Code Block previews then crashed actual MCPJam browser tabs. Measurement isolated redundant Sucrase passes over already emitted JavaScript. Strict ordinary-JavaScript grammar detection now preserves that code unchanged and skips both transforms; JSX/TypeScript still use strict validation and compilation. The unchanged import gate rejects computed and disallowed imports in either path. On the same 19,102,584-character Conversation payload, isolated preparation fell from 7,850 to 2,781 ms (65%), and sampled Node RSS fell from 1,323,298,816 to 785,453,056 bytes (41%). These measurements concern preparation, not browser peak memory or complete rendering time; actual-client verification is recorded separately.
- Cult Side Panel's fixed YouTube example imported every ReactPlayer provider, including an unused provider with a computed remote import that correctly failed the import gate. The adapter now selects ReactPlayer 2.16.0's documented YouTube-only entry, guarded by the exact source hash, import and fixed URL. It uses the original player/provider code. YouTube's remote SDK and iframe remain blocked and explicitly disclosed.
- Build-time archive verification authenticates complete official npm archives before restoration, rejects traversal and links, and checks every bundled input against its archive hash. Independent review found that stale cached license or nested package metadata could otherwise be accepted; the final builder authenticates these metadata files too. Regeneration after the fix produced byte-identical bundle and lock files.
- A separate read-only review challenged the final parser, Web Awesome integration and reproduction disclosures and found no further actionable defect. Direct comparison with the prior PR commit confirms all upstream component source-file hashes, CSP domains and iframe sandbox permissions are unchanged. Only Hexta's generated example composition changed to mount its original toast host.

## Evidence limits

The package ledger has 206 unique adapters; 158 have detailed DOM records and 48 retain explicitly labeled recovered status observations after an interrupted evidence-file write. No DOM details were invented for recovered rows. Later reruns are recorded separately. The source-adapter ledger covers 244 unique adapters.

The latest baseline observations contained visible errors in 149 source adapters and nine package adapters. These include failed imports and expected external-resource restrictions; they are not 158 independent component-implementation bugs. Separate repair-pass ledgers supersede a baseline outcome only when the same ID was actually observed again.

The in-app browser sometimes rejected pointer input in fractional nested-frame coordinates or timed out before dispatch. Keyboard interactions were verified where they worked. Hidden/clipped input interactions and the remaining file-picker selection/replacement/removal states are not claimed as passes. The user's earlier manual confirmation establishes only that the native file selection dialog opens.

Multiple same-origin MCPJam tabs exhausted the browser's HTTP/1 event-stream connection pool. Using one client tab per origin restored requests; that transport stall was not classified as a component failure. No CSP setting was relaxed.

Later reruns used MCPJam's documented native `ui_execute_tool` browser action as well as its edited-input Run button. The native action appends another live rendered app, so the test selects the latest observed frame and verifies its displayed component identity. Periodic client reloads release earlier animated frames. A stale-frame observation in the package ledger is explicitly invalidated and excluded from outcomes.

## Latest verified results and remaining work

The production build and **186/186 tests passed** (`npm test`); `npm run typecheck` passed after the final runtime change. Final source/CSP review found no actionable defect. These checks do not establish browser recovery.

The closing browser pass verified ReUI Gantt, Magic Bento Grid and Code Comparison, all seven original Integration Hub SVGs, and Kibo Announcement, Banner, Calendar, Choicebox, Color Picker, Combobox and Contribution Graph. ElevenLabs Audio Player mounted, but the attempted track-selection keys were not dispatched by automation, so playback is unverified. Magic Tweet Card retained its expected live-network CSP restriction.

The delegated repair pass contains 60 unique source adapters: latest observations were clean for 59; Side Panel exposed the computed-import problem subsequently fixed in code. Its new official-provider adapter still needs a browser rerun. Shader Lens Blur rendered its actual canvas, Shift Card decoded its original PNG, and Orb rendered all three actual canvases.

Conversation and Kibo Code Block crashed earlier MCPJam tabs. After the measured fast-path repair, Conversation still became unresponsive; Windows then failed to start even a small independent process with error 1455 (paging file too small). Native Node module parsing completed, but that is not browser recovery. The test servers and heavy diagnostics were stopped. Browser control ultimately reported its transport closed. No more browser outcomes are inferred from this point.

**53 repair-queue IDs still need an observed final rerun**, plus Conversation and Side Panel. Their baseline results remain in the ledger, not silently replaced by a passing compile. The remaining IDs are:

- kibo-ui/Code Block
- kibo-ui/Credit Card
- kibo-ui/Dropzone
- kibo-ui/Editor
- kibo-ui/Gantt
- kibo-ui/Glimpse
- kibo-ui/Kanban
- kibo-ui/List
- kibo-ui/Marquee
- kibo-ui/Mini Calendar
- kibo-ui/Pill
- kibo-ui/QR Code
- kibo-ui/Rating
- kibo-ui/Reel
- kibo-ui/Sandbox
- kibo-ui/Snippet
- kibo-ui/Spinner
- kibo-ui/Table
- kibo-ui/Tags
- kibo-ui/Theme Switcher
- kibo-ui/Tree
- kibo-ui/Video Player
- cult-ui/AI Blob Warp
- cult-ui/AI Instructions
- cult-ui/Apple Iphone 17 Pro
- cult-ui/Apple Keyboard
- cult-ui/Apple Watch Ultra
- cult-ui/Bg Animated Fractal Grid
- cult-ui/Bg Image Texture
- cult-ui/Bg Media
- cult-ui/Border Beam Button
- cult-ui/Border Beam Card
- cult-ui/Border Beam Input
- cult-ui/Canvas Fractal Grid
- cult-ui/Choice Poll
- cult-ui/Circuit Board
- cult-ui/Code Block
- cult-ui/Collab Avatar
- cult-ui/Color Picker
- cult-ui/Copy Button
- cult-ui/Direction Aware Tabs
- cult-ui/Distorted Glass
- cult-ui/Dock
- cult-ui/Dynamic Island
- cult-ui/Expandable
- cult-ui/Family Button
- cult-ui/Family Drawer
- cult-ui/Feature Poll
- cult-ui/Feature Voting
- cult-ui/File Icons
- cult-ui/Floating Panel
- cult-ui/Fluted Glass
- cult-ui/Globe

Resume in a recovered supported browser/client, verify the two large previews in isolation, rerun Side Panel, then complete this queue and selected interactions. File-picker selection, replacement, removal and validation also remain unverified; the user's manual confirmation establishes only opening the chooser.

## Evidence

- [Component observations, interactions and limits](preview-remaining-client-results-2026-10-25.json)
- [Original Hexta toast](images/original-hexta-toast-mcpjam.png)
- [Original Video Text media](images/original-video-text-mcpjam.png)
- [Original Web Awesome select](images/original-webawesome-select-mcpjam.png)
