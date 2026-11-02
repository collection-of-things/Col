// Opt-in: exercise Hope's actual components under the Col iframe sandbox in both themes.
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import { build } from "esbuild";
import { hopePreviewFiles, patchHopePreview } from "./hope-review-patches.mjs";

const sourceRoot = resolve("data/solid-libraries/hope-ui");
const resolveDir = resolve(process.env.HOPE_BUILD_DIR ?? "node_modules/.cache/solid-previews/hope-ui");
const require = createRequire(import.meta.url);
const graphRequire = createRequire(resolve(resolveDir, "package.json"));
const { chromium, expect } = require((process.env.PLAYWRIGHT_MODULE ?? "playwright") + "/test");
const babel = graphRequire("@babel/core");
const presets = [
  [graphRequire.resolve("babel-preset-solid"), { generate: "dom", hydratable: false, moduleName: "@solidjs/web" }],
  [graphRequire.resolve("@babel/preset-typescript"), { allExtensions: true, isTSX: true }],
];
const aliases = Object.fromEntries(Object.entries(JSON.parse(await readFile(resolve(sourceRoot, "aliases.json"), "utf8"))).map(([key, path]) => [key, resolve(sourceRoot, path)]));
const files = new Map(hopePreviewFiles.map(path => [resolve(sourceRoot, "upstream", path), path]));
const patched = process.env.HOPE_REVIEW_UNPATCHED !== "1";
const compile = async (source, filename) => (await babel.transformAsync(source, { filename, babelrc: false, configFile: false, presets })).code;
const fixture = await compile(`
  import { Alert } from "@hope-ui/components/alert";
  import { Combobox } from "@hope-ui/components/combobox";
  import { Select } from "@hope-ui/components/select";
  import { Calendar } from "@hope-ui/components/calendar";
  import { CalendarDate } from "@internationalized/date";
  import { FRUITS, FruitControl, FruitPopup, isItemDisabled, itemToLabel, itemToValue } from ${JSON.stringify(resolve(sourceRoot, "upstream/apps/docs/src/components/demos/combobox/data.tsx"))};
  import { ThemeProvider } from "@hope-ui/theming";
  import { hope } from "@hope-ui/presets/hope";
  import { render } from "@solidjs/web";
  function Example() {
    return <ThemeProvider preset={hope}>
      <Alert.Root>
        <Alert.Icon data-testid="default">Default</Alert.Icon>
        <Alert.Icon data-testid="undefined" aria-hidden={undefined}>Meaningful</Alert.Icon>
        <Alert.Icon data-testid="false" aria-hidden="false">Visible</Alert.Icon>
        <Alert.Title>Alert</Alert.Title>
      </Alert.Root>
      <Combobox.Root items={FRUITS} itemToValue={itemToValue} itemToLabel={itemToLabel} isItemDisabled={isItemDisabled} modal={false} closeOnEscape={false}>
        <FruitControl label="Keep combobox open" /><FruitPopup />
      </Combobox.Root>
      <Combobox.Root items={FRUITS} itemToValue={itemToValue} itemToLabel={itemToLabel} isItemDisabled={isItemDisabled} modal={false}>
        <FruitControl label="Close combobox" /><FruitPopup />
      </Combobox.Root>
      <Select.Root items={["Apple", "Banana"]} modal={false} closeOnEscape={false}>
        <Select.Trigger aria-label="Keep select open"><Select.Value placeholder="Choose" /><Select.Icon /></Select.Trigger>
        <Select.Portal><Select.Positioner><Select.Content><Select.List>{item => <Select.Item item={item}><Select.ItemText>{item}</Select.ItemText></Select.Item>}</Select.List></Select.Content></Select.Positioner></Select.Portal>
      </Select.Root>
      <Select.Root items={["Apple", "Banana"]} modal={false}>
        <Select.Trigger aria-label="Close select"><Select.Value placeholder="Choose" /><Select.Icon /></Select.Trigger>
        <Select.Portal><Select.Positioner><Select.Content><Select.List>{item => <Select.Item item={item}><Select.ItemText>{item}</Select.ItemText></Select.Item>}</Select.List></Select.Content></Select.Positioner></Select.Portal>
      </Select.Root>
      <Calendar.Root aria-label="Booking dates" name="booking" selectionMode="range" locale="en-US" defaultFocusedValue={new CalendarDate(2026, 1, 5)} isDateDisabled={date => date.compare(new CalendarDate(2026, 2, 20)) === 0} />
      <Calendar.Root aria-label="Reverse booking" name="reverseBooking" selectionMode="range" locale="en-US" defaultFocusedValue={new CalendarDate(2026, 3, 25)} isDateDisabled={date => date.compare(new CalendarDate(2026, 2, 10)) === 0} />
      <Calendar.Root aria-label="Single date" locale="en-US" defaultFocusedValue={new CalendarDate(2026, 1, 5)} />
    </ThemeProvider>;
  }
  render(() => <Example />, document.getElementById("col-root"));
`, resolve(sourceRoot, "hope-review-fixture.tsx"));
const result = await build({
  absWorkingDir: resolveDir, bundle: true, write: false, format: "esm", platform: "browser", target: "es2022", conditions: ["browser"],
  define: { "process.env.NODE_ENV": '"production"', "import.meta.env.DEV": "false", "import.meta.env.PROD": "true" },
  stdin: { resolveDir, loader: "js", contents: fixture },
  plugins: [{ name: "hope-review-sources", setup(builder) {
    builder.onResolve({ filter: /.*/ }, args => {
      if (args.pluginData?.resolved || /^(?:[./]|[A-Za-z]:[\\/])/.test(args.path)) return;
      const alias = Object.keys(aliases).sort((a, b) => b.length - a.length).find(key => args.path === key || args.path.startsWith(key + "/"));
      const target = alias ? resolve(aliases[alias], args.path.slice(alias.length).replace(/^\//, "")) : args.path;
      const local = relative(resolveDir, args.resolveDir).replaceAll("\\", "/");
      const from = local === "node_modules" || local.startsWith("node_modules/") ? args.resolveDir : resolveDir;
      return builder.resolve(target, { kind: args.kind, resolveDir: from, pluginData: { resolved: true } });
    });
    builder.onLoad({ filter: /\.[jt]sx?$/ }, async ({ path }) => {
      const name = files.get(path);
      if (!name && !/\.[jt]sx$/.test(path)) return;
      const original = await readFile(path, "utf8");
      const source = name && patched ? patchHopePreview(name, original) : original;
      return { contents: /\.[jt]sx$/.test(path) ? await compile(source, path) : source, loader: /\.[jt]sx$/.test(path) ? "js" : "ts", resolveDir: dirname(path) };
    });
  } }],
});
const code = result.outputFiles[0].text.replaceAll("</script", "<\\/script");
const css = await readFile(resolve(resolveDir, "preview.compiled.css"), "utf8");
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, headless: true });
try {
  for (const theme of ["light", "dark"]) {
    const page = await browser.newPage({ colorScheme: theme });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setContent('<iframe data-col-preview sandbox="allow-scripts allow-forms" style="width:1000px;height:900px"></iframe>');
    await page.locator("iframe").evaluate((element, documentHtml) => { element.srcdoc = documentHtml; }, `<!doctype html><html class="${theme}"><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; font-src data:; img-src data:; connect-src 'none'"><style>${css}</style></head><body><div id="col-root"></div><script type="module">${code}</script></body></html>`);
    const frame = page.frameLocator("iframe");
    await expect(frame.getByTestId("default")).toHaveAttribute("aria-hidden", "true");
    await expect(frame.getByTestId("undefined")).not.toHaveAttribute("aria-hidden");
    await expect(frame.getByTestId("false")).toHaveAttribute("aria-hidden", "false");
    const keepCombobox = frame.getByRole("combobox", { name: "Keep combobox open" });
    await keepCombobox.fill("cafe");
    await expect(keepCombobox).toHaveAttribute("aria-expanded", "true");
    await keepCombobox.press("Escape");
    await expect(keepCombobox).toHaveAttribute("aria-expanded", "true");
    await expect(keepCombobox).toHaveValue("cafe");
    const closeCombobox = frame.getByRole("combobox", { name: "Close combobox" });
    await closeCombobox.fill("cafe");
    await expect(closeCombobox).toHaveAttribute("aria-expanded", "true");
    await closeCombobox.press("Escape");
    await expect(closeCombobox).toHaveAttribute("aria-expanded", "false");
    for (const [label, expanded] of [["Keep select open", "true"], ["Close select", "false"]]) {
      const trigger = frame.getByRole("combobox", { name: label });
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await trigger.press("Escape");
      await expect(trigger).toHaveAttribute("aria-expanded", expanded);
    }
    const calendar = frame.getByRole("group", { name: "Booking dates" });
    await calendar.getByRole("button", { name: /January 5, 2026/ }).click();
    if (process.env.HOPE_REVIEW_KEYBOARD === "1") await calendar.getByRole("button", { name: /January 5, 2026/ }).press("PageDown");
    else await calendar.locator('[data-slot="calendar-next-button"]').click();
    await expect(calendar.locator('[data-slot="calendar-heading"]')).toContainText("February 2026");
    await expect(calendar.getByRole("button", { name: /February 25, 2026/ })).toHaveAttribute("aria-disabled", "true");
    await calendar.getByRole("button", { name: /February 19, 2026/ }).click();
    await expect(frame.locator('input[name="bookingStart"]')).toHaveValue("2026-01-05");
    await expect(frame.locator('input[name="bookingEnd"]')).toHaveValue("2026-02-19");
    const reverse = frame.getByRole("group", { name: "Reverse booking" });
    await reverse.getByRole("button", { name: /March 25, 2026/ }).click();
    if (process.env.HOPE_REVIEW_KEYBOARD === "1") await reverse.getByRole("button", { name: /March 25, 2026/ }).press("PageUp");
    else await reverse.locator('[data-slot="calendar-prev-button"]').click();
    await expect(reverse.locator('[data-slot="calendar-heading"]')).toContainText("February 2026");
    await expect(reverse.getByRole("button", { name: /February 5, 2026/ })).toHaveAttribute("aria-disabled", "true");
    await reverse.getByRole("button", { name: /February 11, 2026/ }).click();
    await expect(frame.locator('input[name="reverseBookingStart"]')).toHaveValue("2026-02-11");
    await expect(frame.locator('input[name="reverseBookingEnd"]')).toHaveValue("2026-03-25");
    const single = frame.getByRole("group", { name: "Single date" });
    const next = single.locator('[data-slot="calendar-next-button"]');
    await next.click();
    await expect(single.locator('[data-slot="calendar-heading"]')).toContainText("February 2026");
    await expect(next).toBeFocused();
    expect(errors).toEqual([]);
    console.log(`PASS Alert, Calendar, Combobox, and Select variants and sandbox: ${theme}`);
    await page.close();
  }
} finally { await browser.close(); }
