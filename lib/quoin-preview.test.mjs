import assert from "node:assert/strict";
import { test } from "node:test";
import { createComponentPreview } from "./component-preview.ts";
import { verifiedPreviewFragmentHtml } from "./preview-widget.ts";
import { JSDOM } from "jsdom";
import bundles from "../data/component-previews/quoin.json" with { type: "json" };
import examples from "../data/quoin/examples.json" with { type: "json" };
import { createHash } from "node:crypto";
import { parse } from "@babel/parser";

test("a Quoin component renders its pinned Solid implementation in both output formats", () => {
  const preview = createComponentPreview({ id: "quoin-ui/Button", theme: "dark" }, "https://git.cafe/versecafe/quoin");
  assert.equal(preview.available, true);
  assert.equal(preview.runtime, "solid");
  assert.equal(preview.package, "quoin-ui");
  assert.equal(preview.version, "0.6.0");
  assert.match(preview.code, /export/);
  for (const notice of bundles.source.notices) assert.ok(preview.code.includes(notice.text.trim()), `${notice.package} license must accompany delivery`);
  assert.ok(preview.gaps.some(gap => gap.includes("2.0.0-rc.18")));
  assert.ok(!preview.gaps.some(gap => gap.includes("React 19")));
  const html = verifiedPreviewFragmentHtml(preview);
  assert.match(html, /sandbox="allow-scripts allow-forms"/);
  assert.match(html, /colRuntime\(\(message\) => parent\.postMessage\(\{ colError: message \}, &quot;\*&quot;\), &quot;solid&quot;\)/);
  assert.match(html, /quoin-ui@0\.6\.0/);
});

async function withDom(run) {
  const dom = new JSDOM('<!doctype html><div id="target"></div>', { pretendToBeVisual: true });
  const saved = new Map();
  // JSDOM has no layout engine; these observers do not claim positioning coverage.
  dom.window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  for (const key of ["window", "document", "Node", "Element", "HTMLElement", "HTMLInputElement", "HTMLButtonElement", "HTMLFormElement", "HTMLTextAreaElement", "HTMLSelectElement", "ShadowRoot", "MutationObserver", "ResizeObserver", "navigator", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "Event", "CustomEvent", "MouseEvent", "KeyboardEvent"]) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { value: typeof dom.window[key] === "function" && ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"].includes(key) ? dom.window[key].bind(dom.window) : dom.window[key], configurable: true });
  }
  try {
    await run(dom.window.document.getElementById("target"), dom.window);
  } finally {
    dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

test("the shipped Quoin Button updates Solid state and disposes its DOM", async () => {
  await withDom(async target => {
    let dispose;
    try {
      const preview = createComponentPreview({ id: "quoin-ui/Button" }, "https://git.cafe/versecafe/quoin");
      const { default: mount } = await import('data:text/javascript;base64,' + Buffer.from(preview.code).toString("base64"));
      dispose = mount(target);
      const button = target.querySelector("button");
      assert.equal(button.textContent, "Count: 0");
      button.click();
      await new Promise(resolve => setTimeout(resolve, 0));
      assert.equal(button.textContent, "Count: 1");
      dispose();
      dispose = undefined;
      assert.equal(target.childElementCount, 0);
    } finally { dispose?.(); }
  });
});

test("all 40 published Quoin families ship closed dependency graphs and mount real DOM", async t => {
  assert.equal(Object.keys(bundles.entries).length, 40);
  for (const [name, bundle] of Object.entries(bundles.entries)) {
    await t.test(name, async () => {
      assert.equal(createHash("sha256").update(bundle.code).digest("hex"), bundle.integrity);
      assert.equal(createHash("sha256").update(examples[name].code + "\n" + examples[name].css).digest("hex"), bundle.exampleIntegrity, `${name} needs rebuilding after its example changed`);
      const ast = parse(bundle.code, { sourceType: "module" });
      assert.ok(!ast.program.body.some(node => node.type === "ImportDeclaration"));
      await withDom(async target => {
        const { default: mount } = await import('data:text/javascript;base64,' + Buffer.from(bundle.code + `\n// ${name}`).toString("base64"));
        const dispose = mount(target);
        try {
          await new Promise(resolve => setTimeout(resolve, 0));
          assert.ok(target.querySelector("*"), `${name} should produce an actual component composition`);
        } finally { dispose(); }
        assert.equal(target.childElementCount, 0, `${name} must dispose its root`);
      });
    });
  }
});

test("Quoin dialog opens, closes, and removes portal content on disposal", async () => {
  await withDom(async (target, window) => {
    const { default: mount } = await import('data:text/javascript;base64,' + Buffer.from(bundles.entries.Dialog.code + "\n// dialog interaction").toString("base64"));
    const dispose = mount(target);
    try {
      target.querySelector("button").click();
      await new Promise(resolve => setTimeout(resolve, 50));
      const dialog = window.document.querySelector('[role="dialog"]');
      assert.ok(dialog, "the actual dialog portal opens");
      const close = [...dialog.querySelectorAll("button")].find(button => button.textContent === "Close");
      close.click();
      await new Promise(resolve => setTimeout(resolve, 50));
      assert.equal(window.document.querySelector('[role="dialog"]'), null);
      target.querySelector("button").click();
      await new Promise(resolve => setTimeout(resolve, 50));
    } finally { dispose(); }
    assert.equal(window.document.querySelector('[role="dialog"]'), null, "disposing the root removes its portal");
  });
});

test("Quoin Select updates the displayed choice through its real popup", async () => {
  await withDom(async (target, window) => {
    const { default: mount } = await import('data:text/javascript;base64,' + Buffer.from(bundles.entries.Select.code + "\n// selection interaction").toString("base64"));
    const dispose = mount(target);
    try {
      const trigger = target.querySelector("button");
      trigger.click();
      await new Promise(resolve => setTimeout(resolve, 30));
      const option = [...window.document.querySelectorAll('[role="option"]')].find(element => element.textContent === "Serif");
      assert.ok(option, "the real selection popup supplies the documented options");
      option.click();
      await new Promise(resolve => setTimeout(resolve, 30));
      assert.equal(trigger.textContent, "Serif");
    } finally { dispose(); }
  });
});

test("Quoin nested menu handles keyboard opening and local selection", async () => {
  await withDom(async (target, window) => {
    const { default: mount } = await import('data:text/javascript;base64,' + Buffer.from(bundles.entries.Menu.code + "\n// submenu interaction").toString("base64"));
    const dispose = mount(target);
    try {
      target.querySelector("button").click();
      await new Promise(resolve => setTimeout(resolve, 30));
      const share = [...window.document.querySelectorAll('[role="menuitem"]')].find(element => element.textContent === "Share");
      assert.ok(share);
      share.focus();
      share.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 30));
      const copy = [...window.document.querySelectorAll('[role="menuitem"]')].find(element => element.textContent === "Copy link");
      assert.ok(copy, "ArrowRight opens the controlled submenu");
      copy.click();
      await new Promise(resolve => setTimeout(resolve, 30));
      assert.equal(target.querySelector("output").textContent, "Copy link selected");
    } finally { dispose(); }
    assert.equal(window.document.querySelector('[role="menu"]'), null);
  });
});
