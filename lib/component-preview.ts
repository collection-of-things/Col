import * as z from "zod/v4";

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

export function componentPreviewSupport(id: string) {
  const recipe = Object.hasOwn(recipes, id) ? recipes[id] : undefined;
  return recipe
    ? { available: true as const, package: recipe.package, version: recipe.version, exportName: recipe.exportName, gaps: [...recipe.gaps, ...commonGaps] }
    : { available: false as const, gaps: ["Preview unavailable: no verified implementation adapter is recorded for this component. Col will not generate an approximation. Use the official documentation or verify it in your app."] };
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
  const recipe = recipes[args.id];
  const theme = args.theme ?? "light";
  const provider = recipe.provider === "mantine";
  const imports = [
    ...recipe.stylesheets.map((sheet) => `import ${JSON.stringify(sheet)};`),
    `import { ${recipe.exportName}${provider ? ", MantineProvider" : ""} } from ${JSON.stringify(`${recipe.package}@${recipe.version}`)};`,
  ].join("\n");
  const content = provider
    ? `<MantineProvider forceColorScheme=${JSON.stringify(theme)}>${recipe.jsx}</MantineProvider>`
    : recipe.jsx;
  const code = `${imports}
document.documentElement.style.colorScheme = ${JSON.stringify(theme)};
document.documentElement.classList.toggle("dark", ${theme === "dark"});
document.body.style.background = ${JSON.stringify(theme === "dark" ? "#000" : "#fff")};
export default function LibraryPreview() { return (<>${content}<style>{${JSON.stringify(args.styles ?? "")}}</style></>); }
`;
  return { ...identity, ...support, code, theme };
}
