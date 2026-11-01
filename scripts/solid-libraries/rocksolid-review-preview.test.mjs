import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM, VirtualConsole } from "jsdom";
import { createComponentPreview } from "../../lib/component-preview.ts";

const globals = ["window", "document", "Node", "Element", "HTMLElement", "HTMLInputElement", "HTMLButtonElement", "HTMLFormElement", "HTMLTextAreaElement", "HTMLSelectElement", "HTMLAnchorElement", "HTMLIFrameElement", "HTMLDialogElement", "HTMLHeadElement", "SVGElement", "ShadowRoot", "MutationObserver", "ResizeObserver", "IntersectionObserver", "NodeFilter", "navigator", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "Event", "CustomEvent", "MouseEvent", "KeyboardEvent", "Image"];
const settle = () => new Promise(resolve => setTimeout(resolve, 30));

async function withPreview(id, theme, check) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", error => errors.push(error));
  const dom = new JSDOM('<!doctype html><div id="target"></div>', { pretendToBeVisual: true, virtualConsole });
  const win = dom.window;
  win.document.documentElement.classList.toggle("dark", theme === "dark");
  win.scrollTo = () => {};
  win.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  win.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
  win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  const saved = new Map(globals.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const key of globals) Object.defineProperty(globalThis, key, { value: ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"].includes(key) ? win[key].bind(win) : win[key], configurable: true });
  let dispose;
  try {
    const preview = createComponentPreview({ id, theme }, "https://example.test/documentation");
    assert.equal(preview.available, true);
    const { default: mount } = await import("data:text/javascript;base64," + Buffer.from(preview.code).toString("base64"));
    const target = win.document.getElementById("target");
    dispose = mount(target);
    await settle();
    await check(win, target);
    assert.deepEqual(errors, []);
  } finally {
    dispose?.();
    dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

for (const theme of ["light", "dark"]) {
  test(`RockSolid Badge names its notification button in ${theme} theme`, async () => {
    await withPreview("rocksolid/Badge", theme, async (_win, target) => {
      assert.ok(target.querySelector('button[aria-label="Notifications"]'));
      assert.match(target.textContent, /50/);
    });
  });

  test(`RockSolid Chip deletes both examples by pointer and keyboard in ${theme} theme`, async () => {
    await withPreview("rocksolid/Chip", theme, async (win, target) => {
      target.querySelector('[aria-label="Remove Chip 1"] > span:last-child').click();
      const second = target.querySelector('[aria-label="Remove Chip 2"]');
      second.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
      await settle();
      assert.equal(target.textContent.includes("Chip 1"), false);
      assert.equal(target.textContent.includes("Chip 2"), false);
    });
    await withPreview("rocksolid/Chip", theme, async (win, target) => {
      target.querySelector('[aria-label="Remove Chip 1"]').dispatchEvent(new win.KeyboardEvent("keydown", { key: "Delete", bubbles: true, cancelable: true }));
      target.querySelector('[aria-label="Remove Chip 2"]').click();
      await settle();
      assert.equal(target.textContent.includes("Chip 1"), false);
      assert.equal(target.textContent.includes("Chip 2"), false);
    });
  });

  test(`RockSolid Accordion keeps collapsed panels inert in ${theme} theme`, async () => {
    await withPreview("rocksolid/Accordion", theme, async (win, target) => {
      const summary = [...target.querySelectorAll("button")].find(button => button.textContent.includes("gravity"));
      const panel = [...target.querySelectorAll('[aria-hidden="true"]')].find(element => element.textContent.includes("Gravity is a force"));
      assert.ok(summary && panel);
      assert.equal(panel.inert, true);
      summary.click();
      await settle();
      assert.equal(panel.inert, false);
      assert.equal(panel.getAttribute("aria-hidden"), "false");
      summary.click();
      await settle();
      assert.equal(panel.inert, true);
      assert.equal(panel.getAttribute("aria-hidden"), "true");
    });
  });

  test(`RockSolid vertical Tabs support keyboard navigation in ${theme} theme`, async () => {
    await withPreview("rocksolid/Tabs", theme, async (win, target) => {
      const list = target.querySelector('[role="tablist"]');
      const tabs = list.querySelectorAll('[role="tab"]');
      assert.equal(list.getAttribute("aria-orientation"), "vertical");
      assert.equal(tabs.length, 3);
      assert.equal(tabs[0].tabIndex, 0);
      const key = (tab, name) => tab.dispatchEvent(new win.KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true }));
      tabs[0].focus();
      assert.equal(key(tabs[0], "ArrowDown"), false);
      assert.equal(win.document.activeElement, tabs[1]);
      assert.equal(key(tabs[1], "ArrowRight"), true);
      assert.equal(win.document.activeElement, tabs[1]);
      assert.equal(key(tabs[1], "End"), false);
      assert.equal(win.document.activeElement, tabs[2]);
      tabs[2].click();
      await settle();
      assert.equal(tabs[2].getAttribute("aria-selected"), "true");
      assert.equal(tabs[2].tabIndex, 0);
    });
  });
}
