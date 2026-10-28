# Actual library component previews

`render_component` accepts a catalog component ID, user CSS, and a light/dark color scheme. Col selects the implementation. It does not accept agent-written TSX, substitute HTML, arbitrary package URLs, or caller-selected exports.

```json
{
  "id": "shadcn-ui/Button",
  "theme": "dark",
  "styles": "[data-slot=button] { border-radius: 0; }"
}
```

Call `get_component` first. Its `preview` field states whether an adapter is available, its package/version or source revision, and reproduction limits. IDs are case-sensitive. Availability describes a source-backed adapter, not a guarantee that every browser, network dependency, or app configuration has been tested.

## What runs

Package adapters compose the actual exports from pinned npm releases. Source adapters compile the original upstream component and demo files at immutable revisions. Required library CSS and providers accompany the implementation. Some npm dependencies are bundled during development from an integrity-checked lockfile; others load from esm.sh with the same pinned React runtime. Col never generates a replacement component after a failure.

Quoin's 40 public component/provider families use `quoin-ui@0.6.0` with Solid `2.0.0-rc.18`. Their reviewed examples are compiled before delivery, with a complete authenticated dependency graph, and mounted with Solid rather than React. Both output formats retain the same sandbox and dispose the Solid root on replacement or teardown. Readable API and example snapshots are separately available from `get_component`; see [Solid 2 and Quoin](quoin-solid.md). Simulated DOM tests verify mounting and representative interactions, not live-client layout or positioning.

Shadcn uses actual CLI-installed base-nova source (CLI 4.22.1, neutral palette, Lucide icons) and official demos pinned to commit `617134d5810bba521803b3ed787190bacbb80b35`. Its real stylesheet, Tailwind utilities and animations are compiled ahead of time. Chart and Sonner retain their available official New York source, disclosed per preview. Typeset uses the official HTML fixture and stylesheet. These choices are explicit; they do not imply that another shadcn style or an edited copy in the user's repository is identical.

User CSS is appended after library CSS inside the execution frame. It cannot hide the source and limitations outside that frame. Both the MCP Apps view and `format: "html"` use the same implementation and disclosure. Preserve the complete HTML fragment and its sandbox when embedding it.

Widget source travels in request-keyed MCP Apps result metadata; model-facing results contain identity and limitations without the bundle. A client that drops that metadata receives a visible missing-source error. HTML fallback retains the complete fragment for text-only clients. Genuine bundles and CSS can make individual previews several megabytes; only the selected implementation is sent, but transport and browser parsing still have that cost. Strictly valid ordinary JavaScript is preserved without redundant compilation; JSX and TypeScript still receive strict validation and compilation. Both paths enforce the same import restrictions.

Selected original demo images, textures, animations, audio and video are embedded as unchanged, hash-pinned bytes. Their original URLs, attribution and hashes appear in the preview's asset disclosure and discovery metadata. Repository assets use immutable revisions; remote avatars and photos are explicitly snapshots, not live updates. Relocating their URLs does not widen CSP. Unknown assets and user-supplied CSS URLs remain subject to the host policy and visible failure reporting.

Small assets retain the 2 MB inline budget. Selected larger original videos and audio tracks are separate hash-pinned binary snapshots, bounded to 75 MB per file. MCP Apps loads them through server resource reads of at most 1.5 MB of original bytes (2 MB base64) per response. Both server and view verify each chunk; the view assembles unchanged media outside the JavaScript compiler. No arbitrary URL/file reader or browser network permission is added. The complete original still consumes transfer and browser memory.

These large-media examples require MCP Apps server-resource access. Clients without it receive a visible error; `format: "html"` explicitly returns unavailable for these examples instead of embedding enormous payloads or substituting media. Ordinary standalone HTML previews keep their existing behavior.

Unavailable upstream files, unrecorded oversized assets, live network services, external player frames and microphone capture cannot always be reproduced in the opaque sandbox. Known limitations are listed for the affected component. Col does not substitute media, emulate a backend or broaden sandbox permissions to conceal those gaps. Web Awesome system icons retain the library's bundled SVG artwork and official icon-registry extension, avoiding a network fetch for data already present locally.

Cult Side Panel's fixed YouTube example uses ReactPlayer's official YouTube-only entry. The adapter checks the exact source hash, import and fixed video URL before selecting that entry; source drift fails visibly. Its original panel/player code is retained, while YouTube's remote SDK and iframe remain blocked and disclosed.

## Coverage

The expanded registry includes package adapters for Mantine, Radix, Base UI, React Aria, Ark UI, Headless UI, Material UI, Chakra UI, HeroUI, cmdk and Web Awesome. Original-source adapters cover shadcn, Magic UI, Cult UI, Kibo UI, Intent UI, ReUI, ElevenLabs UI, Tween UI, Hexta UI, Be UI and Loading.so.

Shadcn has source adapters for 62 of its 65 indexed IDs. Navigation Menu, Aspect Ratio and Direction remain unavailable because their selected official examples depend on Next routing, Next image handling or documentation translation context that this isolated preview cannot reproduce faithfully.

This does not mean that every component in every catalog library can render. Each unsupported indexed component returns an explicit reason: missing browser-compatible source, framework runtime, application/server integration, or redistribution permission. Libraries without indexed component IDs remain discoverable as libraries. There is no substitution with a similarly named primitive. See the [coverage report](qa/mcp-preview-expansion-2026-10-25.md), [dependency and asset follow-up](qa/mcp-preview-closure-2026-10-25.md), [remaining-component client verification](qa/mcp-preview-remaining-2026-10-25.md), [final reruns and styling verification](qa/mcp-preview-final-reruns-2026-10-26.md), and [original-media resource verification](qa/mcp-preview-resources-2026-10-27.md) for measured browser outcomes and remaining reproduction limits.

## Reproduction limits

Every preview shows its identity, official documentation and limits outside the styled frame. Source previews also link the pinned source and display its integrity hash.

- Implementations are real; example props, sample content and layout are fixed. App data, callbacks, routing and surrounding layout are not connected.
- React 19.3.0 and recorded dependency versions are pinned. Col does not inspect the user's installed versions or local modifications.
- `theme` selects light or dark; `styles` accepts up to 10,000 characters of CSS, including custom properties. App-specific theme objects, fonts, assets and extra providers are not imported automatically.
- Preview fallback colors and typography occupy the lowest CSS layer, so the library's own styles take precedence. The browser's default root font size is preserved. Supplied user CSS is applied after library CSS inside the component frame.
- Headless libraries remain headless. Documentation-site styling is not part of those packages. Shadow DOM components expose their own styling boundaries.
- Original demo images, fonts, media or network requests may be unavailable under the existing CSP. Failures remain visible, including when a component's own fallback renders. CSP is not relaxed to make a demo appear complete.
- The original shadcn Sidebar collapses and expands, but its cookie write is blocked by the opaque sandbox. The preview explicitly discloses this persistence limit and reports the browser error; it does not emulate storage or grant same-origin access.
- `sent-to-chat` means the server supplied a preview. Only inspecting the client establishes that it mounted. MCP Apps failures are also reported to model context.

## Maintaining verified source

The generated manifests live in `data/component-previews/`; recipes are in `lib/component-preview-packages.ts` and `lib/component-preview.ts`. Source metadata retains revision, source URLs and hashes, dependency pins, CSS inputs and licenses. Committed vendor snapshots/lockfiles make the selected input versions reviewable.

```sh
node scripts/build-shadcn-previews.mjs
node scripts/build-component-previews.mjs
node scripts/build-preview-package-css.mjs
node scripts/build-preview-package-bundles.mjs
node scripts/build-preview-package-bundles.mjs --supplemental
node scripts/build-preview-assets.mjs
node scripts/build-preview-media.mjs
```

These are development-time builds, not network calls on each tool request. They require the root development dependencies and network access for any uncached pinned dependencies. Extra source rebuilds compare downloaded/cached bytes with committed source pins; an intentional reviewed source change requires `--refresh-source-pins`. Package rebuilds restore dependencies with `npm ci` from their committed lockfile. Review generated source, license and dependency changes before committing.

The supplemental package build closes dependency graphs used by the source demos, including React Aria collections, Tiptap, Shiki, Streamdown and Sandpack, while retaining shared React and required shared package contexts. Emitted packages retain upstream license notices or an explicitly labeled upstream license declaration when no notice file is published. Pinned upstream records cover npm tarballs that omit them.

On systems where a full npm installation is impractical, `--restore-runtime-files` restores runtime files from complete, integrity-checked official npm archives. `--verify-installed-runtime` retries the build against the same authenticated archives and checks every bundled input against its original bytes. Neither option trusts an unverified cached file or runs package install scripts.

The asset build verifies the committed snapshot offline by default. Use `--refresh-assets` only to intentionally recapture original assets, then review their hashes and attribution. Passive SVG flags and icons are validated and preserved unchanged; active or externally referencing SVGs are rejected. Container validation does not establish media playback; verify changed media in a supported client.

The separate media builder verifies original references, immutable snapshot bytes, containers and chunk hashes offline. Use `--capture-missing-media` only to capture explicitly added original URLs. Binary snapshots are included in the `/api/mcp` deployment trace; they are not imported into server startup JSON or executable preview source.

The source builders use esbuild; library styles use PostCSS and the library's Tailwind pipeline. Tests use the same pinned module lexer and Sucrase compiler as the browser runtime. Adding an adapter requires the real export/source, full required browser setup, explicit gaps and browser verification. Source identity checks and a successful compile alone do not establish visual or interaction parity.

## Migration

The former `{ "code": "..." }` API is intentionally rejected, including code supplied alongside a valid ID. Use discovery's exact ID and presentation options only. Unsupported components should be inspected in their official docs or the user's app, never recreated and labeled as the original.
