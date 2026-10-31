shadcn-solid is pinned to `hngngn/shadcn-solid@4c75b892148dc81f81167a43756d4ce0fbfe6eae`. It is a separate project from SolidUI. `sources.json` retains the official MIT source, original Geist variable fonts and their SIL license. `corpus.json` supplies readable evidence separately from website metadata.

Rebuild from the repository root:

```sh
npm ci --prefix data/solid-libraries/shadcn-solid --ignore-scripts
node scripts/solid-libraries/shadcn-solid.mjs
```

The pinned registry uses Tailwind 4 and Kobalte. The isolated Solid 1.9.17/Kobalte 0.13.14 graph satisfies its upstream dependency ranges. The wrapper maps Col's selected theme to the original `data-kb-theme` mechanism, including portal content, and restores the attribute on disposal.

Coverage follows all 48 documented component pages with their pinned official demos. The build writes the complete artifact to `shadcn-solid-packed.json` as Brotli-compressed, base64-encoded JSON; the original tracked `shadcn-solid.json` remains intact. The account/password forms are local UI examples and do not save account data. The pinned Dialog implementation omits its default close icon unless the caller explicitly supplies `showCloseButton`; its original Escape and overlay dismissal remain intact. Sidebar's original preference-cookie write is blocked by the opaque sandbox. `coverage.json` records each page and its preview status.

Preview verification uses the public `render_component` HTML path in light and dark themes. Source, stylesheet, package and bundle hashes are recorded independently. Layout and pixel equality across every browser and host are not implied.

`build-evidence.json` records each preview's source and group, plus each group's code, CSS, lock, input-graph and package-graph hashes. Group input indices and package keys point to deduplicated records in the same file; the package records match the committed lockfile.

The Data Table documentation snapshot links to its complete pinned example because the source exceeds the inline snapshot limit.
