> During this review stack, rebuild scripts and preview artifacts arrive in the final integration stage.

Zaidan is pinned to `carere/zaidan@271ffce00aaeee0dfa32f2321c9b6e212af39c3d`. `sources.json` retains the official MIT source and attribution for its shadcn-derived utilities. Fontsource's original Geist Variable and Inter Variable Latin font faces and SIL licenses are authenticated against the package lock during the build. `corpus.json` is separate from client catalog metadata.

Rebuild from the repository root:

```sh
npm ci --prefix data/solid-libraries/zaidan --ignore-scripts
node scripts/solid-libraries/zaidan.mjs
```

Coverage follows all 58 documented Kobalte component pages with their official demos and default Vega style. The isolated Solid 1.9.17/Kobalte 0.13.14 graph satisfies the pinned upstream ranges. The build writes the complete artifact to `zaidan-packed.json` as Brotli-compressed, base64-encoded JSON; the original tracked `zaidan.json` remains intact. The wrapper places `style-vega` on the document root so portals inherit the same styling. It retains the original `[data-slot="docs"]` font rule on the mount target: inline components inherit Geist, while portals outside that context inherit the body's Inter font. Both attributes are restored on disposal. Toast receives the original color-mode provider initialized with the selected theme. Unsplash photographs are delivered as quality-90 WebP at their original dimensions; the Vercel gradient is a pixel-identical lossless WebP. `assets.json` records attribution, original and delivered hashes and sizes, and conversions. GitHub profile photographs without verified redistribution permission are disclosed when unavailable.

The build compiles the original Vega sections and the selected component examples. It hoists six unchanged calendar keyframe definitions from the nested style selector so the CSS optimizer preserves them. Unrelated presets and documentation-only styles are omitted. It extracts the unchanged `cn` helper from the docs utility module so server-only storage initialization is not bundled. Every adaptation is recorded in `preview.json` and `build-evidence.json`; source bytes stay intact in `sources.json`.

Preview verification uses the public `render_component` HTML path in light and dark themes. The profile form is a local demonstration with no backend. Other Zaidan style presets are not claimed as previewed, and layout and pixel equality across every browser and host are not implied.

`build-evidence.json` records each preview's source and group, plus each group's code, CSS, lock, input-graph and package-graph hashes. Group input indices and package keys point to deduplicated records in the same file; the package records match the committed lockfile.

The Sidebar documentation snapshot links to its complete pinned example because the source exceeds the inline snapshot limit.

Chrome 156 comparisons with the live official Dialog page confirmed identical accessibility trees: the visible Cancel and icon Close controls are both named `Dismiss`. They are inside the dialog and remain focusable. The dialog portal sits outside the example's form, so Save changes has no owning form and does not submit. Col preserves these upstream limitations and reports them in the preview and component evidence. Cancel and Escape removed the dialog and overlay and returned focus to Open Dialog in light/dark and reduced-motion checks. The official page and Col both retained the same Inter font, 14px corners and 100ms entrance animation, including when reduced motion was requested.
