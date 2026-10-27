---
name: ui-components
description: Find, inspect, and implement UI components from Col's curated catalogue. Use when choosing a UI library for a project or adding a component to one, so recommendations are source-linked and gaps are explicit.
---

# UI components with Col

Col's `col` MCP server searches a curated UI library catalogue and its verified
component index. It is read-only and never requests credentials. Its coverage
is partial: a missing component means "not yet verified", never "this library
does not have it". Every answer links to its canonical source and marks what is
verified, partial, or unverified — pass those links and markers on to the user
instead of smoothing them over.

## 1. Find a fit

Call `search_libraries` with the user's requirement in plain words (it handles
natural phrasing), and narrow with hard filters from the project:
`stacks` for the framework and styling approach (`React`, `Svelte`, `Tailwind
CSS`, …), `category`, `useCases`. Read each hit's `matchedComponents` to see why
it matched, and its `evidence.gaps` before recommending it. Shortlist two or
three candidates and show the user the source links before committing.

## 2. Inspect the exact component

- `search_components` by official name or a real alias (`command palette`,
  `datepicker`), optionally scoped to one library slug.
- `get_component` for the component's own documentation link plus the npm
  dependencies and registry components it needs.
- `get_library` for the full picture: description, the official docs and site to
  set it up from, `gettingStarted` links, pricing, and `compatibility` facts.
  Compatibility facts are `supported`, `unsupported`, or `unknown` — never guess
  past `unknown`, and check `evidence.gaps` for what is unverified.

## 3. Render it in the chat

Read `get_component.preview`. When `available` is true, call
`render_component` with that exact `id`, optional user CSS in `styles`, and
`theme: "light"` or `"dark"`. Col selects a real pinned package export or
original upstream source, including shadcn, with its styles and providers.
Keep the returned source revision, integrity and limitations visible. Implementation code and arbitrary props
are rejected. Use only presentation data; never send credentials or private data.

When unavailable, show the reason and official documentation. A verified
documentation page does not establish runnable source. Do not generate a
substitute and present it as the original component. Keep package versions
and reproduction limits visible; app fonts, data, layout and additional
providers are not reproduced automatically.

Hosts that support MCP Apps render the server-selected implementation. If it
fails, inspect the error reported as model context and explain the limitation.

Claude Code does not show MCP Apps. There, call `render_component` with the
same ID and presentation options with `format: "html"`, then show the returned `html`:

- If you have an inline HTML widget tool (such as `show_widget`), pass `html`
  to it unchanged.
- Otherwise write `<!doctype html><meta charset="utf-8">` followed by `html`
  to a temporary `.html` file and open it in the user's browser.

Errors in this fallback show only inside the render, so ask the user what they
see. Never claim a render you did not see happen.

## 4. Implement in context

1. Inspect the project first: framework, styling approach, TypeScript, and
   existing component conventions.
2. Set up from the library's own documentation, opened through the source
   links Col returned: the component's page and the library's `gettingStarted`
   links. Col records no install commands, so take the current ones from those
   pages rather than from memory.
3. Adapt the installed code to the project's own conventions and theme.
4. Confirm the project still builds and the component renders, and tell the
   user which sources the implementation was based on.
