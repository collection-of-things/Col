import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

test("listing CTR counts one view and one official-link conversion, including middle clicks", async () => {
  const events = [];
  const effects = [];
  let ref;
  const originalElement = globalThis.Element;
  class LinkTarget {
    constructor(destination) { this.destination = destination; }
    closest() { return { getAttribute: () => this.destination }; }
  }
  globalThis.Element = LinkTarget;
  const beacons = [];
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { sendBeacon: (url, body) => beacons.push([url, JSON.parse(body)]) } });
  globalThis.__libraryAnalyticsTest = {
    useRef: () => ref ??= { current: null },
    useEffect: (effect) => effects.push(effect),
    track: (name, properties) => events.push({ name, ...properties }),
    React: { createElement: (_type, props) => props },
  };
  try {
    const source = readFileSync(new URL("../components/LibraryListing.tsx", import.meta.url), "utf8")
      .replace(/^import .*;$/gm, "");
    const compiled = ts.transpileModule(`const { useRef, useEffect, track, React } = globalThis.__libraryAnalyticsTest;\n${source}`, {
      compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React },
    }).outputText;
    const { LibraryListing } = await import(`data:text/javascript,${encodeURIComponent(compiled)}`);
    const listing = LibraryListing({ slug: "wensity-ui", children: null });
    effects[0]();
    effects[0](); // Strict Mode repeats effects without creating another view.
    listing.onClickCapture({ target: new LinkTarget("source") });
    listing.onAuxClickCapture({ button: 2, target: new LinkTarget("docs") });
    assert.equal(events.length, 1);
    listing.onAuxClickCapture({ button: 1, target: new LinkTarget("docs") });
    listing.onClickCapture({ target: new LinkTarget("website") });
    assert.deepEqual(events, [
      { name: "library_listing_view", slug: "wensity-ui" },
      { name: "library_outbound", slug: "wensity-ui", destination: "docs" },
    ]);
    assert.deepEqual(beacons, [
      ["/api/usage", { library: "wensity-ui", event: "view" }],
      ["/api/usage", { library: "wensity-ui", event: "outbound" }],
    ]);
    ref = undefined; // Returning to a listing creates a new page view.
    const revisit = LibraryListing({ slug: "wensity-ui", children: null });
    effects[1]();
    revisit.onClickCapture({ target: new LinkTarget("website") });
    assert.equal(events.length, 4);
  } finally {
    globalThis.Element = originalElement;
    if (originalNavigator) Object.defineProperty(globalThis, "navigator", originalNavigator);
    delete globalThis.__libraryAnalyticsTest;
  }
});
