# Actual library component previews

`render_component` accepts a catalog component ID, user CSS, and a light/dark color scheme. Col selects the implementation. It does not accept agent-written TSX, substitute HTML, arbitrary package URLs, or caller-selected exports.

```json
{
  "id": "mantine/Button",
  "theme": "dark",
  "styles": ".mantine-Button-root { border-radius: 0; }"
}
```

Call `get_component` first. Its `preview` field states whether an implementation adapter is available and, if so, the package, version, export, and limitations. The component ID remains case-sensitive.

## What runs

The server chooses a reviewed example composition that imports the actual published component export from a pinned package through esm.sh. Mantine compositions include its matching stylesheet and MantineProvider. Radix compositions use the library primitives directly. Col does not rewrite their implementation or replace their behavior. User CSS is data inside the execution frame; it cannot restyle the source/limitations disclosure outside it. Required stylesheets must finish loading before mounting. Load failures and CSP violations remain visible; there is no imitation fallback.

The MCP Apps view renders the server's tool result, not code from tool input. Each input clears the previous execution frame, and only a result matching all supplied request fields may render. The HTML format uses the same selection and includes the same disclosure. Preserve the entire returned fragment and its sandbox when embedding it.

## Verified adapter coverage

| Library package | Components | Included setup |
| --- | --- | --- |
| `@mantine/core@9.7.1` | Button, Badge, Checkbox, Switch, TextInput, Textarea, Alert, Card | Matching package CSS, MantineProvider, requested color scheme |
| `radix-ui@1.6.7` | Checkbox, Switch, Dialog | Actual primitive composition; user styling required |

The registry is `lib/component-preview.ts`. These are eleven supported previews, not a claim that the entire catalog can render. Every other ID returns `status: "unavailable"` and an explanation until its exact implementation, dependencies, styles, and required providers have a verified adapter. This includes copy-in components such as shadcn: documentation links or the name of an underlying primitive are not verified component source. An unknown catalog ID remains a tool error.

Sources for the compositions are the catalog's official component documentation, including [Mantine Button](https://mantine.dev/core/button/), [MantineProvider](https://mantine.dev/theming/mantine-provider/), [Radix Checkbox](https://www.radix-ui.com/primitives/docs/components/checkbox), and [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog). The JSX composes those exports; it does not implement the components itself. Package versions are deliberately explicit rather than following latest releases.

## Reproduction limits

The preview always displays package/version, official documentation, and limitations outside the styled frame:

- The component implementation is real, but the composition and sample content are fixed. App data, routing, callbacks, and surrounding layout are not connected.
- React is pinned to 19.3.0. Col does not inspect the user's installed package versions or promise parity with different versions.
- `theme` selects light or dark. `styles` accepts up to 10,000 characters of browser CSS, including custom properties. Native app theme objects, extra providers, global styles, fonts, and assets are not automatically copied. No Tailwind processor or preflight is injected into these previews.
- Radix Primitives are intentionally unstyled. Their documentation demos' appearance is not part of the implementation package. Supply the user's CSS for `CheckboxRoot`, `CheckboxIndicator`, `SwitchRoot`, `SwitchThumb`, `DialogTrigger`, `DialogOverlay`, and `DialogContent` as applicable.
- External resources remain subject to the existing CSP. A missing package, stylesheet, or blocked resource is an error, not evidence of a successful reproduction.
- `sent-to-chat` means the server supplied a preview. Only inspecting the actual client can establish that it rendered. HTML fallback errors stay in the preview; MCP Apps errors are also sent as model context.

## Migration

This intentionally replaces the former `{ "code": "..." }` API. Old code requests, extra implementation fields, and arbitrary props now fail validation. Use the exact ID from discovery and pass only presentation options. Use `format: "html"` for clients without MCP Apps. Unsupported components must be inspected in their official docs or the user's app, never recreated and labeled as the original.

Adding another adapter requires a matching catalog ID, verified published export or unmodified source at an immutable revision, its complete style/provider/dependency setup, and explicit remaining gaps. Validate actual browser behavior before marking that adapter available.
