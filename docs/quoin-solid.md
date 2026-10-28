# Solid 2 and Quoin

Col MCP supports implementing applications with `quoin-ui@0.6.0`. This release requires `solid-js`, `@solidjs/web`, and `@solidjs/signals` at exactly `2.0.0-rc.18`. The package metadata was checked on 2026-10-28; floating prerelease tags are not a compatibility guarantee.

Use `search_components` with library `quoin-ui` and stack `SolidJS`, then pass a returned identifier to `get_component`. `get_library` supplies setup links and exact compatibility facts. Component lookup returns permitted API declarations and readable Solid examples in `documentation.snapshots`; these are separate from executable preview bundles. The client agent edits the developer's application. Col's MCP server remains read-only.

## Evidence and coverage

The inventory covers 40 public component and provider subpaths in the published release, including Toast. `internals`, the root re-export, and package metadata are not separate components. Submenu is documented as part of Menu and searchable through its alias.

Quoin publishes its APIs in source and TypeScript declarations rather than a dedicated component documentation site. Catalog links point to the exact upstream source revision; API snapshots come from the pinned published npm declarations. Large API surfaces include complete selected declarations plus links to the remaining declarations, so an agent can follow type references without receiving the whole library corpus.

Examples use the genuine Quoin exports. Upstream examples retain source references and license attribution; additional reviewed compositions state that they were authored for Col. Quoin provides behavior and styling hooks, while example CSS supplies the appearance. A component's documentation coverage and `preview.available` are independent, and errors or sandbox limitations must remain explicit.

The 33 families backed by upstream demos preserve their official CSS and shared theme: colors, typography, rounded corners, hover/selection backgrounds, focus indicators, and panel styling. Theme media conditions follow the requested preview theme instead of the host OS preference. Toolbar and Navigation Menu retain documented layout constraints for narrow preview viewports; Col's visual theme is not applied to the components.

The pinned repository has no matching demos for Button, Autocomplete, Combobox, Drawer, OTP Field, Direction Provider, or CSP Provider. These seven examples remain explicitly authored compositions. They reuse the cited upstream Dialog, Input, Menu, Tabs, or Scroll Area styles and shared theme, with necessary layout adjustments; they are not presented as official demos. Each example records the theme and stylesheet source hashes.

For Dialog, `createDialog` supplies state and a context provider. Use the Dialog DOM primitives when the application needs the library's focus handling and portal behavior; the headless state API does not supply those behaviors by itself. Provider entries include examples and their own declarations, and Menu declarations cover submenu composition.

The MIT reuse decision gates both general and component-specific snapshots. A denied or unknown permission, or an outbound-only library entry, prevents documentation content from being returned.

## Maintaining the evidence

- Review the pinned release's export map against the component inventory before changing coverage.
- Run `node scripts/build-quoin-documentation.mjs` after installing the recorded package version to capture published API declarations and its setup guide. The script checks the version, peer requirements, and public export inventory before writing snapshots. Each declaration has its source URL and SHA-256 digest.
- Follow each source link when a declaration references another type; do not translate Base UI React props into assumed Quoin props.
- Run `node scripts/snapshot-quoin-examples.mjs <upstream-checkout>` to refresh readable examples from the recorded clean upstream revision. Then run `npm run build:quoin` to refresh API snapshots and executable bundles. Use the project's required Node version; invoking the bundle script directly also requires the current npm executable path. Update source and integrity records together.
- Keep the public MCP journey, permission gates, and focused Solid runtime checks green. A successful compilation or simulated DOM test does not establish live-client rendering, layout, or positioning.

Existing React component support uses its existing runtime. SSR, hydration, server functions, and application-specific data are not executed inside Col's component sandbox. Live browser or MCP-client UI testing requires an explicit user request.

## Sources

- [Published Quoin metadata](https://registry.npmjs.org/quoin-ui/0.6.0)
- [Quoin source revision](https://git.cafe/versecafe/quoin/tree/efff3191148c0af2f720d61f179d0689aac7a073)
- [Published MIT license](https://cdn.jsdelivr.net/npm/quoin-ui@0.6.0/LICENSE)
- [Solid 2 documentation](https://v2.solidjs.com/)
