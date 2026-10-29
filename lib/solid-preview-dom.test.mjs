import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM, VirtualConsole } from "jsdom";
import { createComponentPreview } from "./component-preview.ts";
import { solidPreviews } from "../data/component-previews/solid/index.ts";

const globals = ["window", "document", "Node", "Element", "HTMLElement", "HTMLInputElement", "HTMLButtonElement", "HTMLFormElement", "HTMLTextAreaElement", "HTMLSelectElement", "HTMLAnchorElement", "HTMLIFrameElement", "HTMLDialogElement", "HTMLHeadElement", "SVGElement", "ShadowRoot", "MutationObserver", "ResizeObserver", "NodeFilter", "navigator", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "Event", "CustomEvent", "MouseEvent", "KeyboardEvent", "Image"];
const wait = () => new Promise(resolve => setTimeout(resolve, 30));

test("every Solid preview mounts and disposes its real component and any open portal", async t => {
  for (const id of Object.keys(solidPreviews)) {
    await t.test(id, async () => {
      // JSDOM has no layout engine; the browser suite checks the visual result.
      const dom = new JSDOM('<!doctype html><div id="target"></div>', { pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
      const win = dom.window;
      win.scrollTo = () => {};
      win.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
      win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
      const saved = new Map();
      for (const key of globals) {
        saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { value: ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"].includes(key) ? win[key].bind(win) : win[key], configurable: true });
      }
      let dispose;
      try {
        const preview = createComponentPreview({ id, theme: "dark" }, "https://example.test/documentation");
        assert.equal(preview.available, true);
        const { default: mount } = await import("data:text/javascript;base64," + Buffer.from(preview.code).toString("base64"));
        const target = win.document.getElementById("target");
        dispose = mount(target);
        await wait();
        assert.ok(target.querySelector("*"), `${id} must mount actual DOM`);
        if (id.endsWith("/Dialog")) {
          target.querySelector("button").click();
          await wait();
          assert.ok(win.document.querySelector('[role="dialog"]'), `${id} must open its real portal`);
        }
        dispose();
        dispose = undefined;
        await wait();
        assert.equal(target.childElementCount, 0, `${id} must clear its root`);
        assert.equal(win.document.querySelector('[role="dialog"]'), null, `${id} must remove its portal`);
      } finally {
        dispose?.();
        dom.window.close();
        for (const [key, descriptor] of saved) {
          if (descriptor) Object.defineProperty(globalThis, key, descriptor);
          else delete globalThis[key];
        }
      }
    });
  }
});
