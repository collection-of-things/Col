# MCP reliability verification — 24 October 2026

Implementation of [issue #35](https://github.com/screen-devs/col/issues/35), following [spec #36](https://github.com/screen-devs/col/issues/36). Review base: `c6f03fd`. This is local implementation evidence, not a production deployment or a claim that every possible input is supported.

## Result

The catalog, query limits, Origin policy, shared renderer, and public guidance have been updated. The HTTP sweep passed **1,805 requests and 5,218 assertions**, including every currently advertised library and component. Real browser interaction verified the HTML fallback and a local MCP Apps protocol harness.

**Follow-up completed:** the [JSX validation and MCPJam report](jsx-validation-mcpjam-2026-10-24.md) records strict TSX parsing and verification in the released MCPJam client, including host error reporting, correction, interaction, and desktop/phone dialog bounds. The [25 October CSP follow-up](mcp-apps-csp-2026-10-25.md) resolves the nonfatal SDK warning without relaxing policy. The original run below used a harness; it does not establish other hosts' compatibility. Untested clients remain unverified.

## Changes and tradeoffs

- Exact normalized official library names and stable slugs lead eligible search results. Hard filters still apply first. Component match explanations use the same normalization as inclusion and are deduplicated.
- Both search tools publish and enforce a raw-query limit of 4,096 Unicode code points. Oversized-query errors are concise and do not echo the input. Multiple framework filters retain AND semantics.
- Supplied HTTP Origins must be the canonical service origin or an exact configured `COL_MCP_ALLOWED_ORIGINS` entry. Non-browser requests without Origin continue to work. Host and forwarded-host headers do not establish trust.
- The existing module lexer identifies the actual default export. Comments, strings, aliases, classes, expressions, and newlines work. Static imports, named reexports, and literal dynamic imports share the resolver; stylesheet failures are visible. Import validation preserves ordinary TypeScript import elision.
- Both preview shells use the same execution document. HTML previews have an opaque `allow-scripts allow-forms` sandbox. Each MCP Apps tool input replaces its execution iframe, preventing old timers, errors, and pending mounts from affecting corrected input. Replacing input intentionally resets component state.
- Previews retain a 360px minimum viewport for overlays and grow to a bounded 900px, with scrolling for longer content. Each resize receiver checks the sending frame and positive finite bounds. Width changes can reflow content; height feedback does not repeatedly grow viewport-sized layouts.
- The initial implementation added no package dependencies. The follow-up adds pinned Babel syntax validation because Sucrase tolerates mismatched JSX. No catalog records, tool names, stable IDs, or server-side code execution were added. Existing runtime CDN availability remains a dependency.

## HTTP and catalog verification

Target: local Next.js server at `http://127.0.0.1:3100/api/mcp`. The trusted development origin was explicitly configured as `http://127.0.0.1:3101`. At most three requests ran concurrently.

The current advertised catalog contained **96 libraries and 1,554 component IDs**. Every record resolved, every exact official library name returned its own record with `limit: 1`, and pagination contained no duplicate IDs. All five tools had successful and invalid-input controls. Text and structured result envelopes agreed.

Both tools accepted 4,096 ASCII and supplementary-Unicode code points and rejected 4,097 and the historical 50,000-character input with errors no longer than 256 characters. Normalized name/alias evidence was nonempty, unique, and tied to returned data. Multi-framework requests returned only records satisfying both frameworks.

Absent, canonical, and explicitly configured Origins worked. Untrusted, opaque `null`, malformed, multiple, credential-bearing, path-bearing, and wrong-port Origins received 403. Host spoofing did not bypass the policy. An invalid Origin was rejected before malformed JSON processing. Initialization, notifications, resource discovery, Accept/Content-Type errors, and unknown tool/resource/method envelopes retained their expected behavior.

## Browser verification

Browser: Codex in-app Chromium, reported user agent **Chrome/155.0.0.0 on Windows**. Explicit desktop and mobile viewports were **1280 × 720** and **390 × 844**. The browser loaded HTML returned by actual local MCP calls, with real esm.sh and jsDelivr requests from opaque frames. The harness is labeled as such in its UI.

| User-visible behavior | Observed result |
| --- | --- |
| Module forms | Function, expression, arrow, class, default alias, newline, extra named export, and export-looking comment/string/template controls rendered. Implicit and explicit ReactNode type imports and memo components also rendered. |
| Errors | Missing default, invalid value/object, real syntax error, async component, local import, computed import, server-only import, missing package, missing stylesheet, render throw, and click throw produced visible messages. |
| Real interactions | Counter changed, form validated and displayed synthetic submission feedback, npm and HTTPS lazy imports displayed `Loaded package`, package CSS rendered a calendar, icons loaded, and pinned packages worked. |
| Dialog | A real Radix dialog's title, input, and close control fit inside the 360px viewport. At mobile width its right edge was 351.6px inside a 374px frame. Focus entered the input, Tab wrapped within the dialog, Escape dismissed it, and focus returned to the trigger. |
| Fixed overlay | Plain fixed content and its close control were visible; closing it worked. Its close control ended at 121px inside the 360px frame, rather than outside the historical 53px frame. |
| Independent sizing | One frame grew from 553px to 853px and collapsed to 360px while its neighbor stayed 410px. Narrowing the neighbor to 320px grew it to the 900px cap; widening shrank it again. A later frame's 30-row expansion did not resize the first frame. |
| Resize controls | Negative, zero, NaN, infinite, string, oversized, and unrelated-source height messages did not resize the frame. A `100vh` layout settled at 392px instead of continuing to grow. |
| Isolation | A synthetic parent marker remained unchanged and the preview reported blocked parent access. A button attempting benign local top navigation reported that it was blocked. Forms, styles, imports, clicks, and resizing continued working. |
| Recovery | Render and event errors reached `ui/update-model-context`; corrected input displayed `Recovered widget`. Replacing a pending 15-second module prevented stale mount, delayed Error, and primitive string-rejection effects. The unreplaced delayed-error control did report its error. |
| Theme and CSP | Dark host context reached the nested preview, with white text on a dark canvas. Counter interaction worked under a harness CSP permitting the existing CDN script origins and inline scripts, without eval or blob allowances. This is not proof of every real client's CSP. |
| Responsive content | The same fixture changed from two 608px columns in a 1264px frame to one 342px column in a 374px frame. |

## CoVe: competing explanations and fresh checks

1. **Could acceptance be mistaken for successful rendering?** HTTP delivery and browser outcomes were recorded separately. Tests waited for visible component text, used controls, and inspected geometry/focus.
2. **Could the original export problem be a dependency problem?** Export-looking comment/string cases and plain controls used the same runtime; both now rendered. Default aliases and class forms provided independent syntax controls.
3. **Could lazy import failures be merely CDN delay?** Literal npm and HTTPS controls were activated through their buttons and both reached the same loaded state. Missing-package and missing-CSS controls still produced explicit failures.
4. **Could dialog DOM presence hide clipping?** Bounds were compared with the actual frame viewport, screenshots were retained, and keyboard dismissal/focus restoration were exercised at desktop and narrow widths.
5. **Could stale errors still poison correction?** A short 1.8-second attempt completed before replacement and was not counted as proof. A fresh 15-second control verified replacement before the deadline, then confirmed the corrected preview and absence of stale context reports after the deadline. An unreplaced delayed-error control established that the failure path itself worked.
6. **Could responsive measurements be stale automation state?** Initial measurements were discarded when viewport targeting had not settled. Final results include the actual child viewport dimensions and a fresh narrow-page load.
7. **Could Unicode schema limits disagree with runtime?** ASCII and supplementary characters were tested at both boundaries over the MCP transport, not just through a direct validator.

## Known limits and checks still required

- The initial run found that Sucrase tolerated `<main>Broken</div>`. This is fixed by the follow-up's strict TSX parser, verified before user code executes. Type checking remains outside the preview contract.
- The follow-up verifies the released MCPJam client. Actual Claude, ChatGPT, Cursor, and Codex MCP Apps clients remain unverified; the harness and client-emulation profiles do not establish their compatibility. Direct browser-Origin checks remain separate from MCPJam's proxy connection.
- Arbitrary computed imports, server components, local project files, and all possible npm package/browser combinations are outside the supported preview contract. No universal sandbox-security claim is made.
- This run did not deploy, merge, probe sensitive data, or perform sustained load testing. A few browser automation actions required reload/re-observation; those transient tool errors were not attributed to the product.

## Standards

Final independent review: all reported findings are addressed, including stale execution, resize suppression, commented CSS imports, and implicit type-import preservation. No remaining actionable standards findings. Source review was separate from the coordinating browser/build verification.

## Spec

Final independent source review found no remaining confirmed implementation defect after the execution-frame and resizing changes. The follow-up resolves the actual-client verification gap using MCPJam and rejects the browser-discovered mismatched-JSX case.

Review summary: zero outstanding actionable source-review findings on either axis. See the follow-up for new checks and precise client-compatibility limits.

## Reproduction and evidence

Run `npm test` (includes the production build), then `npm run typecheck` after generated build output is stable. Focused renderer, directory, tool, evaluation, and Origin tests are included in the normal suite.

Checks on the initial implementation: `npm test` passed the production build and **124 tests**; `npm run typecheck` passed; `git diff --check` passed. The follow-up reran the production build and **127 tests**, typecheck, and diff check after adding JSX validation.

The working environment retains raw HTTP results, scripts, emitted HTML, browser observations, protocol logs, and screenshots under `artifacts/col-mcp-fixes-2026-10-24/`. These large local artifacts are not part of the source change. The review description includes the test results and attaches representative dialog and multiple-preview screenshots. Historical before-state evidence remains under `artifacts/col-mcp-qa-2026-10-17/`; historical counts are not substituted for this run's catalog.
