import * as z from "zod/v4";
import { packageRecipes, type PackageRecipe } from "./component-preview-packages.ts";
import { transformPreviewPackageImports } from "./component-preview-package-bundles.ts";
import { componentPreviewAssets, transformPreviewAssets } from "./component-preview-assets.ts";
import { webAwesomeSystemIconSetup } from "./component-preview-webawesome.ts";
import { adaptPreviewSourceImports } from "./component-preview-source-adapters.ts";
import extraSources from "../data/component-previews/extra.json" with { type: "json" };
import shadcnSources from "../data/component-previews/shadcn.json" with { type: "json" };
import packageStyles from "../data/component-previews/package-styles.json" with { type: "json" };

/** The public renderer accepts presentation data, never replacement source. */
export const componentPreviewArgs = z.strictObject({
  id: z.string().min(1).max(200).describe("Exact component id from get_component. Check its preview availability first."),
  styles: z.string().max(10_000).optional().describe("User CSS only, including CSS custom properties. Applied inside the component frame; cannot style the provenance or limitations. External assets remain subject to CSP."),
  theme: z.enum(["light", "dark"]).optional().describe("Preview color scheme. Defaults to light; app theme objects are not imported automatically. Use styles for the user's CSS variables."),
  format: z.enum(["widget", "html"]).optional().describe("widget renders in MCP Apps; html returns an isolated HTML preview for other clients. Both use the same verified implementation."),
});

type Recipe = {
  package: string;
  version: string;
  exportName: string;
  jsx: string;
  provider: "mantine" | "none";
  stylesheets: string[];
  gaps: string[];
};

const mantine = (exportName: string, jsx: string): Recipe => ({
  package: "@mantine/core", version: "9.7.1", exportName, jsx, provider: "mantine",
  stylesheets: ["@mantine/core@9.7.1/styles.css"],
  gaps: ["MantineProvider uses the library's default theme plus the requested color scheme. App-specific provider theme objects must be translated to supplied CSS variables; they are not reproduced automatically."],
});
const radix = (exportName: string, jsx: string): Recipe => ({
  package: "radix-ui", version: "1.6.7", exportName, jsx, provider: "none", stylesheets: [],
  gaps: ["Radix Primitives are unstyled. The library behavior is real; its documentation demo styling is not included. Supply your CSS for its named component classes."],
});

/** Reviewed compositions of published exports, not implementations of those exports.
 * Sources are the exact component documentation URLs in data/components.ts.
 * Adding coverage requires checking the pinned package, CSS and provider together.
 * Copy-in libraries need verified source/dependency adapters; never substitute a
 * similarly named primitive for a library's actual implementation. */
const recipes: Readonly<Record<string, Recipe>> = {
  "mantine/Button": mantine("Button", '<Button>Button</Button>'),
  "mantine/Badge": mantine("Badge", '<Badge>Badge</Badge>'),
  "mantine/Checkbox": mantine("Checkbox", '<Checkbox label="Accept terms" />'),
  "mantine/Switch": mantine("Switch", '<Switch label="Notifications" />'),
  "mantine/TextInput": mantine("TextInput", '<TextInput label="Name" placeholder="Enter a name" />'),
  "mantine/Textarea": mantine("Textarea", '<Textarea label="Message" placeholder="Enter a message" />'),
  "mantine/Alert": mantine("Alert", '<Alert title="Notice">Sample notification</Alert>'),
  "mantine/Card": mantine("Card", '<Card><Card.Section>Sample card content</Card.Section></Card>'),
  "radix-ui/Checkbox": radix("Checkbox", '<><Checkbox.Root id="preview-checkbox" className="CheckboxRoot"><Checkbox.Indicator className="CheckboxIndicator">✓</Checkbox.Indicator></Checkbox.Root><label htmlFor="preview-checkbox">Accept terms</label></>'),
  "radix-ui/Switch": radix("Switch", '<><label htmlFor="preview-switch">Notifications</label><Switch.Root id="preview-switch" className="SwitchRoot"><Switch.Thumb className="SwitchThumb" /></Switch.Root></>'),
  "radix-ui/Dialog": radix("Dialog", '<Dialog.Root><Dialog.Trigger className="DialogTrigger">Open dialog</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="DialogOverlay" /><Dialog.Content className="DialogContent"><Dialog.Title>Example dialog</Dialog.Title><Dialog.Description>Sample content. App actions are not connected.</Dialog.Description><Dialog.Close>Close</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>'),
};

const commonGaps = [
  "This is a fixed example composition with sample content. App data, callbacks, routing and surrounding layout are not reproduced.",
  "React 19.3.0 and the listed package version are pinned for this preview; your app's installed versions are not inspected.",
  "Only supplied CSS and color scheme are applied. App fonts, assets, global CSS and additional providers are not loaded automatically. CSP-blocked resources are reported as errors.",
];

/** Observed constraints of the original examples, without replacement content. */
const reproductionGaps: Readonly<Record<string, string[]>> = {
  "shadcn-ui/Sidebar": ["The original Sidebar writes a cookie when toggled. This opaque sandbox blocks cookie persistence: it can collapse and expand, but reports the browser's cookie error. No storage emulation or broader sandbox permissions are applied."],
  "kibo-ui/Stories": ["The original demo's five remote videos could not be retrieved (HTTP 403), and Sarah's avatar is missing (HTTP 404). Four available original avatars are embedded. Video playback and the missing avatar cannot be reproduced; no replacement media is used."],
  "cult-ui/Bg Media": ["The original background video is 21,093,317 bytes, exceeding the 2,000,000-byte preview asset limit. It is not embedded or transcoded, and CSP blocks remote playback. The video's appearance and motion cannot be reproduced here."],
  "kibo-ui/Glimpse": ["The original example fetches a live website to build its link preview. CSP blocks that request, so its remote title, description and image cannot be reproduced here."],
  "kibo-ui/Sandbox": ["The original Sandpack editor needs an external bundler and preview iframe. CSP blocks external connections and frames, so editing UI may render but code execution and its live preview cannot work here."],
  "cult-ui/Youtube Video Player": ["YouTube playback requires an external iframe, which this preview's CSP blocks. Player controls can be inspected, but the video cannot play here."],
  "cult-ui/Side Panel": ["This fixed YouTube example uses ReactPlayer 2.16.0's official YouTube-only entry instead of its all-provider lazy entry. The original panel and player implementations are unchanged. Its remote player SDK and iframe are blocked by this preview's CSP, so the panel can be inspected but the video cannot play here."],
  "elevenlabs-ui/Live Waveform": ["Live microphone input is unavailable in this opaque sandbox. The original idle and processing states can be inspected; live audio capture cannot be reproduced."],
  "elevenlabs-ui/Voice Button": ["Live microphone input is unavailable in this opaque sandbox. The original button can be inspected; live audio capture cannot be reproduced."],
  "elevenlabs-ui/Audio Player": ["Three original sample tracks fit the preview asset budget and are embedded unchanged. Seven tracks exceed the 2,000,000-byte per-file limit and cannot play under this CSP; they are not shortened, transcoded or replaced."],
  "kibo-ui/Video Player": ["The original sample video is 72,619,954 bytes, exceeding the 2,000,000-byte preview asset limit. Controls can be inspected, but this video cannot play here; no replacement media is used."],
  "kibo-ui/Pill": ["One original profile image is unavailable (HTTP 404). Its fallback may render, but the missing portrait cannot be reproduced."],
  "magic-ui/Icon Cloud": ["Five original icon URLs return HTTP 404: java, css3, amazonaws, visualstudiocode and sonarqube. Their artwork cannot be reproduced; the remaining original icons are embedded without substitute logos."],
  "magic-ui/Hero Video Dialog": ["The original thumbnails are embedded, but YouTube playback requires an external iframe that this preview's CSP blocks. The dialog can open; its video cannot play here."],
  "magic-ui/Tweet Card": ["The original example requests live tweet data. CSP blocks that network request, so its tweet content and media cannot be reproduced here."],
};

type SourcePreview = {
  code: string; styleKey: string; package: string; version: string; exportName: string;
  source: { url: string; revision: string; integrity: string };
  gaps: string[];
};
type SourceRegistry = {
  entries: Record<string, SourcePreview>; styles: Record<string, string>;
  unavailable: Record<string, string>; libraryBlockers?: Record<string, string>;
};
const sources: SourceRegistry = {
  entries: { ...extraSources.entries, ...shadcnSources.entries },
  styles: { ...extraSources.styles, ...shadcnSources.styles },
  unavailable: { ...extraSources.unavailable, ...shadcnSources.unavailable },
  libraryBlockers: extraSources.libraryBlockers,
};
const compiledStyles: Readonly<Record<string, { css: string }>> = packageStyles;

function packageRecipe(id: string): PackageRecipe | undefined {
  if (Object.hasOwn(packageRecipes, id)) return packageRecipes[id];
  const recipe = Object.hasOwn(recipes, id) ? recipes[id] : undefined;
  if (!recipe) return undefined;
  const provider = recipe.provider === "mantine";
  return {
    ...recipe,
    imports: `import { ${recipe.exportName}${provider ? ", MantineProvider" : ""} } from ${JSON.stringify(`${recipe.package}@${recipe.version}`)};`,
    jsx: provider ? `<MantineProvider forceColorScheme={PREVIEW_THEME}>${recipe.jsx}</MantineProvider>` : recipe.jsx,
  };
}

export function componentPreviewSupport(id: string) {
  const source = Object.hasOwn(sources.entries, id) ? sources.entries[id] : undefined;
  const recipe = source ?? packageRecipe(id);
  const assets = componentPreviewAssets(id);
  // These generated snapshot notes predate the verified original-asset bundle.
  const gaps = assets.length ? recipe?.gaps.filter(gap => ![
    "The original example's avatar image asset is unavailable in this sandbox; the real AvatarFallback is shown. No replacement image is generated.",
    "The original example's sample attachments or image assets are not hosted in this sandbox. Their loading failures are reported; no replacement assets are generated.",
    "Example links and asset paths belong to the upstream documentation. Their destinations and site-relative images are not supplied by your app; blocked resources are reported.",
    "Upstream theme CSS is included where listed. Site fonts and external images, media, network services and device APIs are not copied; blocked or unavailable resources must be reported.",
  ].includes(gap)).concat("The listed original demo assets are embedded as hash-pinned, unchanged bytes. Remote assets are snapshots, not live updates. Example links, fonts, other assets, network services and device APIs are not reproduced; unavailable resources remain visible errors.") : recipe?.gaps;
  return recipe
    ? { available: true as const, package: recipe.package, version: recipe.version, exportName: recipe.exportName, source: source ? { url: source.source.url, revision: source.source.revision, integrity: source.source.integrity } : undefined, assets, gaps: [...gaps!, ...(reproductionGaps[id] ?? []), ...commonGaps] }
    : { available: false as const, gaps: [sources.unavailable[id] ?? sources.libraryBlockers?.[id.split("/")[0]] ?? "Preview unavailable: no verified implementation adapter is recorded for this component. Col will not generate an approximation. Use the official documentation or verify it in your app."] };
}

export type ComponentPreview = ReturnType<typeof createComponentPreview>;

/** Also used for rejected requests and embedded in the client bridge. */
export function componentPreviewRequestKey(args: object): string {
  return JSON.stringify(Object.entries(args).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
}

/** Source and identity come only from our registry. User CSS is serialized as
 * data and rendered as style text, never interpolated as executable code. */
export function createComponentPreview(args: z.infer<typeof componentPreviewArgs>, docsUrl: string) {
  const support = componentPreviewSupport(args.id);
  const requestKey = componentPreviewRequestKey(args);
  const identity = { id: args.id, docsUrl, requestKey };
  if (!support.available) return { ...identity, ...support };
  const source = Object.hasOwn(sources.entries, args.id) ? sources.entries[args.id] : undefined;
  const recipe = packageRecipe(args.id);
  const theme = args.theme ?? "light";
  const css = source ? sources.styles[source.styleKey] : recipe?.compileCss ? compiledStyles[recipe.compileCss]?.css : "";
  const implementation = transformPreviewAssets(args.id, source ? adaptPreviewSourceImports(args.id, source.code) : `${recipe!.imports}
${(recipe!.stylesheets ?? []).map((sheet) => `import ${JSON.stringify(sheet)};`).join("\n")}
export default function LibraryPreview() { ${recipe!.setup ?? ""} return (${recipe!.jsx}); }`);
  const code = `const PREVIEW_THEME = ${JSON.stringify(theme)};
document.documentElement.style.colorScheme = ${JSON.stringify(theme)};
document.documentElement.classList.toggle("dark", ${theme === "dark"});
const colLibraryStyles = document.createElement("style");
colLibraryStyles.textContent = ${JSON.stringify(`:where(body) { background: ${theme === "dark" ? "#000" : "#fff"}; }\n${css ?? ""}`)};
document.head.append(colLibraryStyles);
const colUserStyles = document.createElement("style");
colUserStyles.textContent = ${JSON.stringify(args.styles ?? "")};
document.head.append(colUserStyles);
${recipe?.package === "@awesome.me/webawesome" ? webAwesomeSystemIconSetup : ""}
${implementation}
`;
  return { ...identity, ...support, code: transformPreviewPackageImports(code), theme };
}
