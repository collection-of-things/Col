import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM, VirtualConsole } from "jsdom";
import { solidPreviews } from "../../data/component-previews/solid/index.ts";

for (const theme of ["light", "dark"]) test(`RockSolid Dialog preserves scroll locks and releases its own lock in ${theme} theme`, async () => {
  const dom = new JSDOM('<!doctype html><div id="target"></div>', { pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
  const win = dom.window;
  win.document.documentElement.classList.toggle("dark", theme === "dark");
  win.scrollTo = () => {};
  win.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  win.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
  win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  const keys = ["window", "document", "Node", "Element", "HTMLElement", "HTMLInputElement", "HTMLButtonElement", "HTMLFormElement", "HTMLTextAreaElement", "HTMLSelectElement", "HTMLAnchorElement", "HTMLIFrameElement", "HTMLDialogElement", "HTMLHeadElement", "SVGElement", "ShadowRoot", "MutationObserver", "ResizeObserver", "IntersectionObserver", "NodeFilter", "navigator", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "Event", "CustomEvent", "MouseEvent", "KeyboardEvent", "Image"];
  const saved = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of keys) Object.defineProperty(globalThis, key, { value: ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"].includes(key) ? win[key].bind(win) : win[key], configurable: true });
  let dispose;
  try {
    const code = `const PREVIEW_THEME = ${JSON.stringify(theme)};\n${solidPreviews["rocksolid/Dialog"].code}`;
    const { default: mount } = await import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
    const target = win.document.getElementById("target");
    const settle = () => new Promise(resolve => setTimeout(resolve, 30));
    win.document.body.classList.add("overflow-hidden");
    dispose = mount(target);
    await settle();
    assert.equal(win.document.body.classList.contains("overflow-hidden"), true, "a closed dialog must not remove an existing lock");
    target.querySelector("button").click();
    await settle();
    win.document.querySelector('[role="dialog"] button').click();
    await settle();
    assert.equal(win.document.body.classList.contains("overflow-hidden"), true, "closing must preserve an existing lock");
    dispose();
    dispose = undefined;
    win.document.body.classList.remove("overflow-hidden");
    dispose = mount(target);
    await settle();
    target.querySelector("button").click();
    await settle();
    assert.equal(win.document.body.classList.contains("overflow-hidden"), true, "opening the dialog locks its document");
    win.document.querySelector('[role="dialog"] button').click();
    await settle();
    assert.equal(win.document.body.classList.contains("overflow-hidden"), false, "closing releases the dialog's lock");
    target.querySelector("button").click();
    await settle();
    win.document.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    await settle();
    assert.equal(win.document.querySelector('[role="dialog"]'), null, "Escape closes the dialog");
    assert.equal(win.document.body.classList.contains("overflow-hidden"), false, "Escape releases the dialog's lock");
    target.querySelector("button").click();
    await settle();
    dispose();
    dispose = undefined;
    await settle();
    assert.equal(win.document.body.classList.contains("overflow-hidden"), false, "disposing an open dialog releases its lock");
  } finally {
    dispose?.();
    dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
