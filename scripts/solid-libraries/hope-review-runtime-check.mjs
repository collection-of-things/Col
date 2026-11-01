// Opt-in behavior checks for upstream variants that the stock Hope UI demos do not expose.
// Set HOPE_BUILD_DIR to the isolated installation used by the Hope UI preview builder.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { build } from "esbuild";
import { hopePreviewFiles, patchHopePreview } from "./hope-review-patches.mjs";

const sourceRoot = resolve("data/solid-libraries/hope-ui");
const resolveDir = resolve(process.env.HOPE_BUILD_DIR ?? "node_modules/.cache/solid-previews/hope-ui");
const aliases = Object.fromEntries(Object.entries(JSON.parse(await readFile(resolve(sourceRoot, "aliases.json"), "utf8"))).map(([key, path]) => [key, resolve(sourceRoot, path)]));
const files = new Map(hopePreviewFiles.map(path => [resolve(sourceRoot, "upstream", path), path]));
const patched = process.env.HOPE_REVIEW_UNPATCHED !== "1";
const file = path => JSON.stringify(resolve(sourceRoot, "upstream", path));
const result = await build({
  absWorkingDir: resolveDir, bundle: true, write: false, format: "esm", platform: "browser", target: "es2022", conditions: ["browser"],
  stdin: { resolveDir, loader: "ts", contents: `
    export { createRoot } from "solid-js";
    export { CalendarDate } from "@internationalized/date";
    export { isRTL } from ${file("packages/i18n/src/direction.ts")};
    export { createCalendar } from ${file("packages/primitives/src/calendar/calendar-root.ts")};
    export { createComboboxInput } from ${file("packages/primitives/src/combobox/combobox-input.ts")};
    export { createComboboxTrigger } from ${file("packages/primitives/src/combobox/combobox-trigger.ts")};
  ` },
  plugins: [{ name: "hope-test-sources", setup(builder) {
    builder.onResolve({ filter: /.*/ }, async args => {
      if (args.pluginData?.resolved || /^(?:[./]|[A-Za-z]:[\\/])/.test(args.path)) return;
      const alias = Object.keys(aliases).sort((a, b) => b.length - a.length).find(key => args.path === key || args.path.startsWith(key + "/"));
      const target = alias ? resolve(aliases[alias], args.path.slice(alias.length).replace(/^\//, "")) : args.path;
      const local = relative(resolveDir, args.resolveDir).replaceAll("\\", "/");
      const from = local === "node_modules" || local.startsWith("node_modules/") ? args.resolveDir : resolveDir;
      return builder.resolve(target, { kind: args.kind, resolveDir: from, pluginData: { resolved: true } });
    });
    builder.onLoad({ filter: /\.[jt]sx?$/ }, async ({ path }) => {
      const name = files.get(path);
      if (!name || !patched) return;
      return { contents: patchHopePreview(name, await readFile(path, "utf8")), loader: path.endsWith(".tsx") ? "tsx" : "ts", resolveDir: dirname(path) };
    });
  } }],
});
const runtime = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const { createRoot, CalendarDate, createCalendar, createComboboxInput, createComboboxTrigger, isRTL } = runtime;
const day = (year, month, date) => new CalendarDate(year, month, date);
const settle = () => new Promise(resolve => setTimeout(resolve, 0));
const failures = [];
async function check(name, fn) {
  try { await fn(); console.log(`PASS ${name}`); }
  catch (error) { failures.push(name); console.error(`FAIL ${name}: ${error.message}`); }
}

await check("locale handling", () => {
  for (const [locale, expected] of [["en-US", false], ["ar-EG", true], ["fa_IR", true], ["AR_eg", true], ["en_US", false], ["", false], ["invalid@", false]]) {
    assert.equal(isRTL(locale), expected, locale);
  }
  const original = Intl.Locale;
  try { Intl.Locale = undefined; assert.equal(isRTL("AR_eg"), true); assert.equal(isRTL("en_US"), false); }
  finally { Intl.Locale = original; }
});

for (const direction of [1, -1]) {
  await check(`calendar blocks unavailable day ${direction > 0 ? "after" : "before"} the anchor`, async () => {
    const anchor = direction > 0 ? day(2026, 1, 5) : day(2026, 3, 25);
    const blocked = direction > 0 ? day(2026, 2, 20) : day(2026, 2, 10);
    const attempted = direction > 0 ? day(2026, 2, 25) : day(2026, 2, 5);
    const calendar = createRoot(() => createCalendar({ selectionMode: "range", defaultFocusedValue: anchor, isDateDisabled: date => date.compare(blocked) === 0 }));
    calendar.activate(anchor);
    await settle();
    direction > 0 ? calendar.next() : calendar.prev();
    await settle();
    calendar.activate(attempted);
    await settle();
    const value = calendar.selectionValue();
    assert.ok(value?.start && value?.end, "range should be committed");
    assert.ok(value.end.compare(blocked) < 0 || value.start.compare(blocked) > 0, `${value.start} to ${value.end} crosses ${blocked}`);
  });
}

await check("calendar permits an explicitly non-contiguous range", async () => {
  const anchor = day(2026, 1, 5), blocked = day(2026, 2, 20), endpoint = day(2026, 2, 25);
  const calendar = createRoot(() => createCalendar({ selectionMode: "range", defaultFocusedValue: anchor, allowsNonContiguousRanges: true, isDateDisabled: date => date.compare(blocked) === 0 }));
  calendar.activate(anchor);
  await settle();
  calendar.next();
  await settle();
  calendar.activate(endpoint);
  await settle();
  assert.equal(calendar.selectionValue()?.end?.toString(), endpoint.toString());
});

await check("calendar honors configured bounds and adjacent unavailable days", async () => {
  const anchor = day(2026, 1, 15), blocked = day(2026, 1, 16);
  const calendar = createRoot(() => createCalendar({ selectionMode: "range", defaultFocusedValue: anchor, min: day(2026, 1, 10), max: day(2026, 1, 31), isDateDisabled: date => date.compare(blocked) === 0 }));
  calendar.activate(anchor);
  await settle();
  assert.equal(calendar.min()?.toString(), "2026-01-10");
  assert.equal(calendar.max()?.toString(), "2026-01-15");
});

for (const kind of ["input", "trigger"]) {
  for (const [open, closeOnEscape] of [[true, false], [true, true], [false, false], [false, true]]) {
    await check(`${kind} Escape with open=${open} closeOnEscape=${closeOnEscape}`, () => {
      let closed = false, reverted = false;
      const state = {
        open: () => open, closeOnEscape: () => closeOnEscape,
        setOpen: value => { if (!value) closed = true; }, setTriggerId() {}, triggerElement: () => undefined,
        list: { disabled: () => false, typeahead: { onKeyDown() {} }, focus: {}, navigation: {}, selection: {} },
      };
      const props = kind === "input" ? { textInput: { inputProps: {} }, onRevert: () => { reverted = true; } } : {};
      const part = createRoot(() => kind === "input" ? createComboboxInput(state, props) : createComboboxTrigger(state, props));
      const event = { key: "Escape", altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
      part.props.onKeyDown(event);
      assert.equal(closed, open && closeOnEscape);
      assert.equal(event.defaultPrevented, open && closeOnEscape);
      if (kind === "input") assert.equal(reverted, open && closeOnEscape);
    });
  }
}
if (failures.length) throw new Error(`${failures.length} Hope UI variant checks failed`);
