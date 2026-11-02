import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM, VirtualConsole } from "jsdom";
import { createComponentPreview } from "./component-preview.ts";
import { inlinePreviewMedia } from "./component-preview-assets.ts";
import { solidPreviews } from "../data/component-previews/solid/index.ts";

const globals = ["window", "document", "Node", "Element", "HTMLElement", "HTMLInputElement", "HTMLButtonElement", "HTMLFormElement", "HTMLTextAreaElement", "HTMLSelectElement", "HTMLAnchorElement", "HTMLIFrameElement", "HTMLDialogElement", "HTMLHeadElement", "SVGElement", "ShadowRoot", "MutationObserver", "ResizeObserver", "IntersectionObserver", "NodeFilter", "navigator", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "Event", "CustomEvent", "MouseEvent", "KeyboardEvent", "Image"];
const wait = () => new Promise(resolve => setTimeout(resolve, 30));

test("each standalone Solid preview and shared bundle mounts and disposes", async t => {
  const groups = new Set();
  const ids = Object.entries(solidPreviews).flatMap(([id, preview]) => {
    if (!preview.group) return [id];
    const key = `${id.split("/")[0]}/${preview.group}`;
    if (groups.has(key)) return [];
    groups.add(key);
    return [id];
  });
  for (const id of ids) {
    await t.test(id, { timeout: 15_000 }, async () => {
      // JSDOM has no layout engine; the browser suite checks the visual result.
      const dom = new JSDOM('<!doctype html><div id="target"></div>', { pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
      const win = dom.window;
      for (const [hash, url] of Object.entries(inlinePreviewMedia(id))) {
        const media = win.document.createElement("script");
        media.type = "application/octet-stream";
        media.id = `col-media-${hash}`;
        media.textContent = url;
        win.document.head.append(media);
      }
      win.scrollTo = () => {};
      win.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
      win.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
      win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
      const saved = new Map();
      const timers = new Set();
      const setTimeoutOriginal = globalThis.setTimeout, setIntervalOriginal = globalThis.setInterval;
      const clearTimeoutOriginal = globalThis.clearTimeout, clearIntervalOriginal = globalThis.clearInterval;
      globalThis.setTimeout = (...args) => { const timer = setTimeoutOriginal(...args); timers.add(timer); return timer; };
      globalThis.setInterval = (...args) => { const timer = setIntervalOriginal(...args); timers.add(timer); return timer; };
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
        for (const timer of timers) { clearTimeoutOriginal(timer); clearIntervalOriginal(timer); }
        globalThis.setTimeout = setTimeoutOriginal;
        globalThis.setInterval = setIntervalOriginal;
        for (const [key, descriptor] of saved) {
          if (descriptor) Object.defineProperty(globalThis, key, descriptor);
          else delete globalThis[key];
        }
      }
    });
  }
});
