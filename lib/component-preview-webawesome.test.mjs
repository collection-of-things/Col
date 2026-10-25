import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { parse } from "@babel/parser";
import { webAwesomeSystemIconSetup } from "./component-preview-webawesome.ts";

function register(original) {
  let registered;
  const decoded = [];
  const originalNodes = [{ type: "comment", value: "upstream license" }, { type: "path", value: "original path data" }];
  const originalAttributes = [{ name: "viewBox", value: "0 0 384 512" }, { name: "xmlns", value: "http://www.w3.org/2000/svg" }];
  const scope = {
    colGetIconLibrary: name => name === "system" ? original : undefined,
    colRegisterIconLibrary: (name, value) => { assert.equal(name, "system"); registered = value; },
    DOMParser: class {
      parseFromString(source, type) {
        decoded.push({ source, type });
        return {
          querySelector: () => null,
          documentElement: {
            localName: "svg", attributes: originalAttributes,
            childNodes: originalNodes.map(node => ({ cloneNode: deep => { assert.equal(deep, true); return { ...node }; } })),
          },
        };
      }
    },
  };
  const ast = parse(webAwesomeSystemIconSetup, { sourceType: "module" });
  const declaration = ast.program.body[0];
  assert.equal(declaration.type, "ImportDeclaration");
  assert.equal(declaration.source.value, "@awesome.me/webawesome@3.14.0/dist/components/icon/library.js");
  runInNewContext(webAwesomeSystemIconSetup.slice(declaration.end), scope);
  return { registered, decoded, originalNodes, originalAttributes };
}

test("Web Awesome adapter uses the official sprite API while preserving original SVG nodes and fill mutator", () => {
  const source = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--upstream license--><path d="original path data"/></svg>';
  const host = { name: "xmark", family: "classic", variant: "solid", autoWidth: false };
  const calls = [];
  const { registered, decoded, originalNodes, originalAttributes } = register({
    resolver: (...args) => { calls.push(args); return "data:image/svg+xml," + encodeURIComponent(source); },
    mutator: (svg, element) => { assert.equal(element, host); svg.setAttribute("fill", "currentColor"); },
  });
  assert.equal(registered.spriteSheet, true);
  const url = registered.resolver(host.name, host.family, host.variant, host.autoWidth);
  assert.match(url, /^#col-system-icon-/);
  assert.notEqual(url, registered.resolver("check", host.family, host.variant, host.autoWidth));
  const attrs = new Map([["part", "svg"]]);
  let children;
  const svg = { setAttribute: (name, value) => attrs.set(name, value), replaceChildren: (...nodes) => { children = nodes; } };
  registered.mutator(svg, host);
  assert.deepEqual(decoded, [{ source, type: "image/svg+xml" }]);
  assert.deepEqual(calls[0], ["xmark", "classic", "solid", false]);
  assert.deepEqual(children, originalNodes);
  for (const attribute of originalAttributes) assert.equal(attrs.get(attribute.name), attribute.value);
  assert.equal(attrs.get("part"), "svg");
  assert.equal(attrs.get("fill"), "currentColor");
  registered.mutator(svg, host);
  assert.equal(decoded.length, 1, "unchanged original SVGs are parsed once");
});

test("Web Awesome adapter refuses missing libraries or non-inline assets without fetching replacements", () => {
  assert.throws(() => register(undefined), /unavailable/);
  for (const uri of ["https://example.com/icon.svg", "data:text/html,svg", Promise.resolve("data:image/svg+xml,")]) {
    const { registered } = register({ resolver: () => uri });
    assert.throws(() => registered.mutator({}, { name: "xmark" }), /not an inline SVG/);
  }
  assert.doesNotMatch(webAwesomeSystemIconSetup, /\bfetch\s*\(|XMLHttpRequest|Content-Security-Policy|unsafe-eval/);
});
