# MCP Apps CSP warning — 25 October 2026

Follow-up to [PR #81](https://git.cafe/screen/col/pulls/81), reviewed against `5a29319`. The nonfatal SDK warning recorded in the [24 October client report](jsx-validation-mcpjam-2026-10-24.md) is now resolved in MCPJam without changing CSP.

## Cause and surgical fix

The pinned `@modelcontextprotocol/ext-apps@2.0.3/app-with-deps` bundle contains a private Zod instance. During module evaluation, SDK schemas construct Zod objects. That triggers Zod's cached `new Function("")` capability probe before the `App` constructor can apply its default `jitless: true` configuration. Catching the denied operation lets initialization continue, but the browser still emits a CSP violation.

The downloaded published bundle reproduced one zero-length Function attempt at `app-with-deps.mjs:2:14327`, the exact location reported by MCPJam. A minimal Node probe blocked string compilation, confirmed valid/invalid schema results, and failed the assertion that the SDK should make zero eval attempts. No component, React render, or host connection was required to trigger it.

The bridge now imports Zod's public `config`, enables `jitless`, then dynamically imports the SDK's standard entry. SDK 2.0.3 is unchanged; its client/core peers are pinned to 2.0.0 and Zod to 4.6.5. The direct Zod import and SDK dependency override resolve to the same version. No private global mutation, patched vendor code, console filtering, validation bypass, CSP relaxation, or new npm dependency is used. The HTML fallback does not load this bridge and is unchanged.

This uses the SDK's intended interpreter mode earlier in initialization. Its tradeoff is a standard ESM dependency graph instead of the prebundled SDK download; CDN availability remains necessary. No speed improvement is claimed.

Primary evidence: [published SDK options](https://unpkg.com/@modelcontextprotocol/ext-apps@2.0.3/dist/src/app.d.ts), [standard SDK source](https://unpkg.com/@modelcontextprotocol/ext-apps@2.0.3/dist/src/app.js), [Zod 4.6.5 eval guard](https://unpkg.com/zod@4.6.5/v4/core/util.js). SDK options document the constructor's default jitless behavior; the source and reproduction establish why constructor timing is too late for the bundled import.

## CoVe in the actual client

Client: released **MCPJam Inspector 3.16.2**, its own MCPJam profile, Strict CSP, Chromium 155 on Windows. Col endpoint: `http://127.0.0.1:3100/api/mcp`. Client: `http://127.0.0.1:6274`, sandbox proxy: `http://localhost:6274`. These are the same local origins used in the preceding run. No model inference was used. The first client launch stalled before listening; a restart of the same published package succeeded without modifying client code or security settings.

| Question / alternative explanation | Check and observed result |
| --- | --- |
| Is the warning really in the SDK rather than generated code? | The minimal SDK-only probe reproduced it. In MCPJam, temporarily restoring the original bootstrap and submitting `export default () => <p>Baseline CSP control</p>` produced one Sandbox violation and two console records for that same event, including the exact bundle line/column. |
| Does the proposed fix remove the actual warning? | Restored the fixed source, reloaded the client to obtain a fresh resource, and submitted the identical plain component. It rendered with no new SDK CSP warnings and no Sandbox warning badge. The fixed bootstrap was also verified before this deliberate reversion, giving fixed → original → fixed observations. |
| Could CSP have been weakened or the detector disabled? | Read the actual CSP meta element from both baseline and fixed app documents: the full strings were identical and excluded `unsafe-eval`. A deliberate `new Function('return 1')()` in the preview threw `EvalError` and its `securitypolicyviolation` listener recorded `script-src:eval`. The original bootstrap also restored the client's warning indicator. |
| Could a broken bridge merely be silent? | The SDK initialized, received tool input, and rendered a stateful counter that advanced from 0 to 1. Invalid JSX then displayed a line/column error and reached MCPJam's Model Context panel through `ui/update-model-context`. Correcting the same widget rendered another counter, which advanced to 1. |
| Is schema validation disabled to avoid eval? | A browser fixture using the same pinned SDK/Zod setup accepted a valid tool-input notification and rejected `{method: 123}`. Its visible results were `Valid accepted: true` and `Malformed rejected: true`. The original bundle's SDK-only probe also validated both controls, confirming that the previous warning was nonfatal rather than a prerequisite for validation. |
| Could retained console entries be mistaken for fresh failures? | Browser logs persisted across reloads. The two baseline records at 19:15:41 UTC were retained as evidence; later records were checked separately by timestamp. There were no new host CSP warnings after restoring the fix, including error reporting and recovery. |

The applied script policy was `script-src 'unsafe-inline' data: blob: https://esm.sh https://cdn.jsdelivr.net`. Those allowances belong to the existing MCPJam Strict policy and were identical in both runs; this change added none. The entire policy, not just script-src, was compared. Col's advertised resource domains and nested `allow-scripts allow-forms` sandbox remain unchanged.

An exploratory old-bundle import inside the nested component frame did not populate MCPJam's outer warning panel. It was not counted as proof of warning absence. The direct bootstrap comparison above and an explicit nested violation listener supplied the reliable observations instead. Some nested keyboard locator actions timed out after focusing the button; sending Enter to that observed focused control worked. These automation limitations were not attributed to Col.

## Checks and review

- The new focused test executes the emitted bridge bootstrap with controlled module boundaries, asserts jitless configuration precedes SDK evaluation, and checks the bridge still connects. It failed on the original ordering and passed on the fix. It does not substitute for the real CDN/client checks above.
- Focused renderer suite: **12 tests passed**.
- `npm test`: production build and **128 tests passed**, with zero failures or skips. `npm run typecheck` and `git diff --check` also passed.
- The first full check found a downloaded upstream `.ts` diagnostic artifact inside the project's TypeScript include scope. Renaming the retained diagnostic copies to `.txt` removed that artifact-only interference; the complete check then passed without another product-code change.

### Standards

Independent review found zero documented-standard violations and zero actionable judgment-call smells in the two-file code/test change. Pinned imports, initialization order, scope, and unchanged CSP were checked.

### Spec

Independent review found zero actionable requirement or implementation findings. The reviewer also ran the focused order test successfully. Real client verification was performed separately by the coordinating agent, not inferred from the mocked test.

## Evidence and limits

Local evidence is retained in `artifacts/col-csp-2026-10-25/`, including the published SDK bundle, failing probe, exact before/after policies, client observations, screenshots, and check logs. The private MCPJam startup logs contain local launch credentials and are excluded from commits and attachments. Representative before/after screenshots are attached to PR #81.

This follow-up verifies MCPJam, not actual Claude, ChatGPT, Cursor, or Codex MCP Apps hosts. It does not claim every arbitrary user module or package is CSP-clean. The broad catalog, transport, responsive-dialog, and fallback coverage from 24 October remains separately dated evidence; it was not repeated for this bridge-only change. Nothing was merged or deployed.
