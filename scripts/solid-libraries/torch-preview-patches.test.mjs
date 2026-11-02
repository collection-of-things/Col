import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { patchTorchPreview } from "./torch-preview-patches.mjs";

const date = value => new Date(`${value}T12:00:00`);
const day = value => new Date(`${value}T00:00:00`);
const iso = value => [value.getFullYear(), String(value.getMonth() + 1).padStart(2, "0"), String(value.getDate()).padStart(2, "0")].join("-");

test("TorchUI preview date comparisons include boundary days and reject earlier days", async () => {
  const root = "data/solid-libraries/torch-ui/upstream/src/components/forms";
  const picker = patchTorchPreview("DatePicker.tsx", await readFile(`${root}/DatePicker.tsx`, "utf8"));
  const range = patchTorchPreview("DateRangePicker.tsx", await readFile(`${root}/DateRangePicker.tsx`, "utf8"));
  const pickerBody = picker.match(/function isDisabled\(d: Date\): boolean \{([\s\S]*?)\r?\n\t\}/)?.[1].replaceAll("()!", "()");
  const rangeBody = range.match(/const isDisabled = \(d: Date\) => \{([\s\S]*?)\r?\n\t\}/)?.[1];
  assert.ok(pickerBody && rangeBody);
  const pickerDisabled = new Function("d", "minDate", "maxDate", "toISODate", pickerBody);
  const rangeDisabled = new Function("d", "props", "toISODate", rangeBody);
  const min = date("2026-10-31"), max = date("2026-11-02");
  for (const [value, disabled] of [["2026-10-30", true], ["2026-10-31", false], ["2026-11-02", false], ["2026-11-03", true]]) {
    assert.equal(pickerDisabled(day(value), () => min, () => max, iso), disabled, value);
    assert.equal(rangeDisabled(day(value), { min, max, selectableFrom: min }, iso), disabled, value);
  }
  assert.equal(pickerDisabled(new Date("2026-10-31T01:00:00"), () => min, () => max, iso), false);
  assert.equal(pickerDisabled(new Date("2026-11-02T23:00:00"), () => min, () => max, iso), false);
  assert.throws(() => patchTorchPreview("DateRangePicker.tsx", range), /preview source changed/);
  assert.equal(patchTorchPreview("Other.tsx", "unchanged"), "unchanged");
});

test("TorchUI chart previews do not initialize or unsubscribe after early cleanup", async () => {
  const root = "data/solid-libraries/torch-ui/upstream/src/components/charts";
  const source = patchTorchPreview("Chart.tsx", await readFile(`${root}/Chart.tsx`, "utf8"));
  const mount = source.match(/onMount\(async \(\) => \{([\s\S]*?)\r?\n\t\}\)/)?.[1]
    .replace("import('chart.js/auto')", "loadChart()")
    .replace("import.meta.env.DEV", "false");
  const cleanup = source.match(/onCleanup\(\(\) => \{([\s\S]*?)\r?\n\t\}\)/)?.[1];
  assert.ok(mount && cleanup);
  const makeChart = new Function("loadChart", "sharedDark", "failCreate", `
    let canvasEl = {}, ChartConstructor, skipNextUpdate, disposed = false, subscribed = false;
    const local = { type: "bar" }, calls = { created: 0, destroyed: 0 };
    const createChart = () => { calls.created++; if (failCreate) throw new Error("creation failed"); };
    const destroyChart = () => { calls.destroyed++; };
    const setChartReady = () => {};
    return { calls, mount: async () => { ${mount} }, cleanup: () => { ${cleanup} } };
  `);
  const sharedDark = { count: 0, subscribe() { this.count++; }, unsubscribe() { this.count--; } };
  const active = makeChart(async () => ({ Chart: class {} }), sharedDark, false);
  await active.mount();
  assert.equal(sharedDark.count, 1);
  let resolveLoad;
  const late = makeChart(() => new Promise(resolve => { resolveLoad = resolve; }), sharedDark, false);
  const loading = late.mount();
  late.cleanup();
  resolveLoad({ Chart: class {} });
  await loading;
  assert.equal(late.calls.created, 0);
  assert.equal(sharedDark.count, 1);
  const failed = makeChart(async () => ({ Chart: class {} }), sharedDark, true);
  await failed.mount();
  failed.cleanup();
  assert.equal(sharedDark.count, 1);
  const failedLoad = makeChart(async () => { throw new Error("load failed"); }, sharedDark, false);
  await failedLoad.mount();
  failedLoad.cleanup();
  assert.equal(sharedDark.count, 1);
  active.cleanup();
  assert.equal(sharedDark.count, 0);

  const sparkline = patchTorchPreview("Sparkline.tsx", await readFile(`${root}/Sparkline.tsx`, "utf8"));
  const prefix = sparkline.match(/onMount\(async \(\) => \{([\s\S]*?ChartCtor = Chart)/)?.[1]
    .replace("import('chart.js/auto')", "loadChart()");
  const sparkCleanup = sparkline.match(/onCleanup\(\(\) => \{([\s\S]*?)\r?\n\t\}\)/)?.[1];
  assert.ok(prefix && sparkCleanup);
  const makeSparkline = new Function("loadChart", `
    let canvasEl = {}, ChartCtor, chartInstance = null, disposed = false, initialized = false;
    return { mount: async () => { ${prefix}; initialized = true; } catch (e) { throw e; } },
      cleanup: () => { ${sparkCleanup} }, initialized: () => initialized };
  `);
  let resolveSpark;
  const spark = makeSparkline(() => new Promise(resolve => { resolveSpark = resolve; }));
  const sparkLoading = spark.mount();
  spark.cleanup();
  resolveSpark({ Chart: class {} });
  await sparkLoading;
  assert.equal(spark.initialized(), false);
  const activeSpark = makeSparkline(async () => ({ Chart: class {} }));
  await activeSpark.mount();
  assert.equal(activeSpark.initialized(), true);
  activeSpark.cleanup();
});
