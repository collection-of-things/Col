# JSX validation and supported MCP Apps client verification

Follow-up to [PR #81](https://git.cafe/screen/col/pulls/81), tested on 24 October 2026 against review base `a00a6f78`. This closes the two open verification items in the [earlier report](mcp-reliability-2026-10-24.md): mismatched JSX rejection and an actual supported-client run. The current implementation tracker/spec is [git.cafe #80](https://git.cafe/screen/col/issues/80); the original requested references were GitHub issues 35 and 36.

## Fix and tradeoff

Sucrase compiled `<main>Broken</div>` instead of rejecting it. The shared preview runtime now parses the original module with pinned `@babel/parser@7.28.5`, with JSX and TypeScript enabled and error recovery disabled, before Sucrase transforms it or any user module executes. Both MCP Apps and the HTML fallback use this path.

Failures show a concise `Invalid TSX` message with one-based line and column, without echoing submitted source. This is syntax validation, not TypeScript type checking. Existing import handling and component validation still run after parsing.

The parser dependency is justified by the reproduced gap in the existing transpiler. The exact version is a development dependency for types and deterministic tests, with both lockfiles updated; the browser imports the same version from esm.sh. This adds a runtime download and parse pass, and retains the existing CDN availability dependency. No performance improvement is claimed.

## Actual client and conditions

- **MCPJam Inspector 3.16.2**, installed from its published npm package, connected to the local Col MCP endpoint and used its actual tool UI, resource sandbox, and host bridge. MCPJam is listed among the [official MCP Apps supported clients](https://github.com/modelcontextprotocol/ext-apps#supported-clients). [Client source](https://github.com/MCPJam/inspector).
- The acceptance checks below used **MCPJam's own client profile**, with Strict CSP enabled. Initial comparison-profile observations are supplementary; they do not establish actual Claude, ChatGPT, or Cursor compatibility. No model chat or paid inference was used.
- Browser: Chromium 155 on Windows, outer viewport 1280 × 720. Col ran at `http://127.0.0.1:3100/api/mcp`; MCPJam at `http://127.0.0.1:6274`, with its sandbox proxy on `http://localhost:6274`. Both client origins were configured as development-only trusted origins. The backend proxy connection does not itself prove direct browser-Origin behavior; the earlier dedicated HTTP Origin checks remain separate evidence.
- All five Col tools were discovered. This follow-up exercised `render_component`; the earlier five-tool/catalog sweep was not repeated or relabeled as a fresh run.
- The client loaded actual CDN packages and rendered Col's MCP Apps resource. This was the released client, not the earlier hand-written protocol harness.

## CoVe: hypotheses, controls, and observations

| Verification question | Independent control and observed result |
| --- | --- |
| Does malformed JSX actually fail, rather than merely return a successful tool envelope? | Submitted mismatched tags through the tool UI. The preview displayed `Invalid TSX`, and MCPJam's Model Context panel received `render_component failed in the chat: Invalid TSX…` through `ui/update-model-context`. A newline-preserving input reported line 2, column 34; the single-line form reported line 1, column 71. |
| Could user code run before the error appears? | Prefixed the invalid module with `document.body.dataset.executed='yes'`. The rendered execution document's attribute remained absent. A corrected module with the identical prefix rendered and set it to `yes`. |
| Is matching only the outer tag sufficient? | Separate nested-tag and fragment mismatches produced visible errors at line 1, columns 40 and 52 respectively. Deterministic tests also cover member-name mismatch, self-closing children, unclosed tags, unfinished attributes, and invalid JSX expressions. |
| Does rejection break subsequent correction? | Edited input in the same widget to a valid stateful component. `Corrected JSX` appeared and keyboard activation changed `Count: 0` to `Count: 1`. |
| Is valid TypeScript or tag-like text rejected accidentally? | A valid fixture combined a generic `<T,>` function, implicit ReactNode type import, aliased default export, fragment, tag-like comment, and literal `</div>` text. It rendered and its typed counter advanced from 0 to 1. Unit controls additionally preserve classes, explicit type imports, member JSX, newlines, and syntax-valid type mismatches. |
| Could parsing break real dependency loading? | Activated a lazy `clsx@2.1.1` import. The control changed from `Not loaded` to `Loaded package`. A real Radix dialog also loaded and opened. |
| Are runtime failures being mistaken for syntax errors? | A syntactically valid throwing component displayed the distinct runtime message `QA runtime control`. |
| Is a dialog merely present but clipped? | Desktop execution viewport was 830 × 360; the opened dialog was at (20, 40), 400 × 95, with its bottom at 135. In MCPJam's Phone preset the actual execution viewport was 334 × 360; dialog bounds were (20, 40), 294 × 116, with right/bottom edges 314/156. Title, input, and close control were visible in both. Focus entered the Name input; Escape dismissed it and restored the trigger focus. |
| Does the other rendering format share the correction? | Loaded unchanged HTML returned by actual `format: "html"` calls. Mismatched JSX displayed `Invalid TSX at line 2, column 34`. The corrected fixture rendered, and a real pointer click advanced its counter from 0 to 1. |

The positive and negative controls establish the requested JSX behavior without treating a returned tool result, DOM presence, or helper test as proof of working UI. Nested-frame pointer automation in MCPJam hit a fractional-coordinate limitation in the automation tool; keyboard interaction succeeded. This was not classified as a product pointer defect.

## Remaining limits and observed warning

MCPJam's Strict CSP reported one blocked `eval` warning from the existing MCP Apps SDK bundle, `https://esm.sh/@modelcontextprotocol/ext-apps@2.0.3/es2022/app-with-deps.mjs:2:14327`. It was not attributed to the new parser. The checks above, including host error-context delivery, continued to work. CSP was not weakened. The exact reason for that SDK eval attempt was not established; the warning remains a compatibility observation for follow-up.

Actual Claude, ChatGPT, Cursor, and Codex MCP Apps hosts were not tested. MCPJam profile emulation is not evidence of those products. This run does not establish every package, browser, syntax proposal, client policy, or future CDN response. Computed/local/server-only imports remain outside the existing contract. Nothing was deployed or merged.

## Checks and review

- `npm test`: production build and **127 tests passed**, zero failures.
- `npm run typecheck`: passed after the production build.
- `git diff --check`: passed.
- Focused renderer suite: **11 tests passed**, including three new validation groups. The added validation seam was first observed failing, then passed after implementation; the original user-visible mismatch was reproduced in the earlier browser run.
- Two earlier production-build attempts were interrupted while a development server was also running. The final isolated `npm test` completed successfully; interrupted attempts are not counted as passing checks.

### Standards

Independent source review of the follow-up found no actionable documented-standard violations or judgment-call maintainability findings. It checked parser placement, types, self-contained embedded code, version/lockfile consistency, and focused tests.

### Spec

Independent source review found no actionable implementation findings: validation precedes execution, error locations do not expose source, and valid TSX remains supported without promising type checking. Source review was separate from the coordinating agent's actual client, fallback, build, and typecheck runs.

## Evidence

Representative client screenshots are attached to PR #81. Local evidence is retained in `artifacts/col-jsx-client-2026-10-24/`: fixture inputs, client observations, unchanged fallback HTML, screenshots, and build/typecheck logs. Raw client startup logs contain a local access token and are deliberately excluded from the commit and PR attachments. The earlier report retains its independently dated broad HTTP/browser evidence.
