// Run against the installed, pinned RockSolid build dependencies; no artifacts are written.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { JSDOM, VirtualConsole } from "jsdom";
import { patchRockSolidPreview } from "./rocksolid-review-patches.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourceRoot = resolve(root, "data/solid-libraries/rocksolid");
const buildDir = resolve(process.argv[2] ?? resolve(root, "node_modules/.cache/solid-previews/rocksolid"));
const require = createRequire(resolve(buildDir, "package.json"));
const babel = require("@babel/core");
const preset = require.resolve("babel-preset-solid");
const typescript = require.resolve("@babel/preset-typescript");
const provenance = JSON.parse(await readFile(resolve(sourceRoot, "provenance.json"), "utf8"));
for (const item of provenance.sources) {
  const bytes = await readFile(resolve(sourceRoot, item.path));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), item.integrity, item.path);
}

const aliases = {
  "rocksolidjs": resolve(sourceRoot, "upstream/src/components"),
  "@": resolve(sourceRoot, "upstream/src"),
};
const transform = (path, source) => process.env.ROCKSOLID_REVIEW_ORIGINAL === "1" ? source :
  patchRockSolidPreview(relative(sourceRoot, path).replaceAll("\\", "/"), source);
if (process.env.ROCKSOLID_REVIEW_DEBUG) console.log("Compiling fixture");
const result = await build({
  absWorkingDir: buildDir,
  entryPoints: [resolve(sourceRoot, "demos/rocksolid-review-fixture.tsx")],
  bundle: true, write: false, format: "esm", platform: "browser", target: "es2022",
  conditions: ["browser"], mainFields: ["browser", "module", "main"],
  define: { "process.env.NODE_ENV": '"production"', "import.meta.env.DEV": "false", "import.meta.env.PROD": "true" },
  plugins: [{ name: "rocksolid-review", setup(builder) {
    builder.onResolve({ filter: /.*/ }, async args => {
      if (args.pluginData?.resolved) return;
      const alias = Object.keys(aliases).find(key => args.path === key || args.path.startsWith(`${key}/`));
      if (alias) return builder.resolve(resolve(aliases[alias], args.path.slice(alias.length).replace(/^\//, "")), { kind: args.kind, resolveDir: buildDir, pluginData: { resolved: true } });
      if (/^(?:[./]|[A-Za-z]:[\\/])/.test(args.path)) return;
      const local = relative(buildDir, args.resolveDir).replaceAll("\\", "/");
      const from = local === "node_modules" || local.startsWith("node_modules/") ? args.resolveDir : buildDir;
      return builder.resolve(args.path, { kind: args.kind, resolveDir: from, pluginData: { resolved: true } });
    });
    builder.onLoad({ filter: /\.[jt]sx$/ }, async ({ path }) => {
      const source = transform(path, await readFile(path, "utf8"));
      const compiled = await babel.transformAsync(source, { filename: path, babelrc: false, configFile: false,
        presets: [[preset, { generate: "dom", hydratable: false, moduleName: "solid-js/web" }], [typescript, { allExtensions: true, isTSX: true }]] });
      return { contents: compiled.code, loader: "js", resolveDir: dirname(path) };
    });
    builder.onLoad({ filter: /\.ts$/ }, async ({ path }) => {
      const original = await readFile(path, "utf8");
      const source = transform(path, original);
      if (source !== original) return { contents: source, loader: "ts", resolveDir: dirname(path) };
    });
  } }],
});
if (process.env.ROCKSOLID_REVIEW_DEBUG) console.log("Compiled fixture");

const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", error => errors.push(error));
const dom = new JSDOM('<!doctype html><div id="target"></div>', { pretendToBeVisual: true, virtualConsole });
const win = dom.window;
win.scrollTo = () => {};
win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
const keys = ["window", "document", "Node", "Element", "HTMLElement", "HTMLInputElement", "HTMLButtonElement", "HTMLFormElement", "HTMLTextAreaElement", "HTMLSelectElement", "HTMLAnchorElement", "HTMLIFrameElement", "HTMLDialogElement", "HTMLHeadElement", "SVGElement", "ShadowRoot", "MutationObserver", "NodeFilter", "navigator", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "Event", "CustomEvent", "MouseEvent", "KeyboardEvent", "Image"];
const saved = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
for (const key of keys) Object.defineProperty(globalThis, key, { value: ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"].includes(key) ? win[key].bind(win) : win[key], configurable: true });
let dispose;
try {
  const { mount, createTheme } = await import("data:text/javascript;base64," + Buffer.from(result.outputFiles[0].text).toString("base64"));
  if (process.env.ROCKSOLID_REVIEW_DEBUG) console.log("Imported fixture");
  let themeError;
  try { createTheme({ colors: null }); } catch (error) { themeError = error.message; }
  assert.match(themeError ?? "", /Invalid theme configuration/);
  const target = win.document.getElementById("target");
  const byId = id => win.document.getElementById(id);
  const settle = () => new Promise(resolve => setTimeout(resolve, 25));
  win.document.body.classList.add("overflow-hidden");
  dispose = mount(target);
  if (process.env.ROCKSOLID_REVIEW_DEBUG) console.log("Mounted fixture");
  await settle();
  assert.equal(win.document.body.classList.contains("overflow-hidden"), true, "closed dialogs retain the existing body lock");

  const panel = byId("accordion-test-details");
  assert.equal(panel.getAttribute("aria-hidden"), "true");
  assert.equal(panel.inert, true);
  byId("accordion-test-summary").click();
  await settle();
  assert.equal(panel.getAttribute("aria-hidden"), "false");
  assert.equal(panel.inert, false);
  byId("accordion-test-summary").click();
  await settle();
  assert.equal(panel.inert, true);

  const images = target.querySelectorAll("img");
  assert.equal(images[0].alt, "Ada Lovelace");
  assert.equal(images[1].alt, "Grace Hopper");
  images[0].dispatchEvent(new win.Event("error"));
  images[1].dispatchEvent(new win.Event("error"));
  await settle();
  assert.equal(byId("image-error").textContent, "tuple");

  const crumbs = () => target.querySelectorAll('[aria-label="Breadcrumb"] > ol > li');
  assert.equal(crumbs().length, 1);
  byId("add-crumb").click();
  await settle();
  assert.equal(crumbs().length, 3);
  assert.equal(crumbs()[2].textContent, "Second");

  const select = byId("uncontrolled");
  assert.equal(select.value, "one");
  select.value = "two";
  select.dispatchEvent(new win.Event("change", { bubbles: true }));
  assert.equal(select.value, "two");

  const vertical = byId("no-selection");
  const [ariaDisabled, disabled, first, second] = vertical.querySelectorAll('[role="tab"]');
  assert.equal(vertical.getAttribute("aria-orientation"), "vertical");
  assert.equal(ariaDisabled.tabIndex, -1);
  assert.equal(disabled.tabIndex, -1);
  assert.equal(first.tabIndex, 0);
  assert.equal(second.tabIndex, -1);
  ariaDisabled.click();
  await settle();
  assert.equal(ariaDisabled.getAttribute("aria-selected"), "false");
  byId("toggle-aria-disabled").click();
  await settle();
  assert.equal(ariaDisabled.tabIndex, 0);
  assert.equal(first.tabIndex, -1);
  ariaDisabled.click();
  await settle();
  assert.equal(ariaDisabled.getAttribute("aria-selected"), "true");
  byId("toggle-aria-disabled").click();
  await settle();
  assert.equal(ariaDisabled.tabIndex, -1);
  assert.equal(first.tabIndex, 0);
  const key = (element, name) => element.dispatchEvent(new win.KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true }));
  first.focus();
  assert.equal(key(first, "ArrowDown"), false);
  assert.equal(win.document.activeElement, second);
  assert.equal(key(second, "ArrowRight"), true);
  assert.equal(win.document.activeElement, second);
  assert.equal(key(second, "Home"), false);
  assert.equal(win.document.activeElement, first);
  assert.equal(key(first, "End"), false);
  assert.equal(win.document.activeElement, second);
  second.click();
  await settle();
  assert.equal(second.tabIndex, 0);
  assert.equal(first.tabIndex, -1);

  const rtl = byId("rtl-tabs").querySelectorAll('[role="tab"]');
  assert.equal(rtl[0].tabIndex, 0);
  rtl[0].focus();
  assert.equal(key(rtl[0], "ArrowLeft"), false);
  assert.equal(win.document.activeElement, rtl[1]);
  byId("choose-tab").click();
  await settle();
  assert.equal(rtl[0].tabIndex, -1);
  assert.equal(rtl[1].tabIndex, 0);

  assert.equal(byId("themed").classList.contains("test-focus-a"), true);
  assert.equal(byId("theme-value").textContent, "test-focus-a");
  byId("change-theme").click();
  await settle();
  assert.equal(byId("themed").classList.contains("test-focus-b"), true);
  assert.equal(byId("theme-value").textContent, "test-focus-b");

  byId("first-dialog").click();
  await settle();
  byId("first-dialog").click();
  await settle();
  assert.equal(win.document.body.classList.contains("overflow-hidden"), true, "a preexisting lock is retained after closing");
  win.document.body.classList.remove("overflow-hidden");
  byId("first-dialog").click();
  byId("second-dialog").click();
  await settle();
  byId("first-dialog").click();
  await settle();
  assert.equal(win.document.body.classList.contains("overflow-hidden"), true, "another open dialog retains the lock");
  byId("second-dialog").click();
  await settle();
  assert.equal(win.document.body.classList.contains("overflow-hidden"), false);
  byId("first-dialog").click();
  await settle();
  dispose();
  dispose = undefined;
  assert.equal(win.document.body.classList.contains("overflow-hidden"), false, "disposing the open dialog releases its lock");
  assert.deepEqual(errors, []);
  console.log("RockSolid source-authenticated variant checks passed.");
} finally {
  dispose?.();
  win.close();
  for (const [key, descriptor] of saved) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
}
