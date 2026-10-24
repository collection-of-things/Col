import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@babel/parser";
import { transformPreviewPackageImports } from "./component-preview-package-bundles.ts";
import packageBundles from "../data/component-previews/package-bundles.json" with { type: "json" };

const imports = code => parse(code, { sourceType: "module", plugins: ["jsx"] }).program.body.filter(node => node.type === "ImportDeclaration").map(node => node.source.value);

test("official package fallback shares React and preserves unrelated imports", () => {
  const code = 'import { Button as ActualButton } from "@headlessui/react@2.2.10"; import * as Headless from "@headlessui/react@2.2.10"; import { useState } from "react"; export default ActualButton;';
  const result = transformPreviewPackageImports(code);
  assert.deepEqual(imports(result).sort(), ["react", "react", "react-dom"]);
  assert.match(result, /const ActualButton = __colOfficialPackage0\["Button"\]/);
  assert.match(result, /const Headless = __colOfficialPackage0/);
  assert.equal((result.match(/var ColLibraryExports\s*=/g) ?? []).length, 1);
  assert.equal(transformPreviewPackageImports(result), result);
});

test("Web Awesome default wrapper imports select the actual bundled wrapper", () => {
  const result = transformPreviewPackageImports('import Button from "@awesome.me/webawesome@3.14.0/dist/react/button/index.js"; export default Button;');
  assert.deepEqual(imports(result), ["react"]);
  assert.match(result, /const Button = __colOfficialPackage0\["WaButton"\]/);
});

test("fallback never redirects another version or invents a missing export", () => {
  const other = 'import { Button } from "@headlessui/react@2.2.9"; export default Button;';
  assert.equal(transformPreviewPackageImports(other), other);
  assert.throws(() => transformPreviewPackageImports('import { ImaginaryWidget } from "@headlessui/react@2.2.10";'), /does not export ImaginaryWidget/);
});

test("bundle loader names cannot collide with source declarations", () => {
  const result = transformPreviewPackageImports('import { Button } from "@headlessui/react@2.2.10"; const __colOfficialPackage0 = 1; export default Button;');
  assert.doesNotThrow(() => parse(result, { sourceType: "module" }));
  assert.match(result, /const Button = __colOfficialPackage_0/);
});

test("official bundles avoid the renderer's nullish and optional-chain rewrite", () => {
  for (const [name, bundle] of Object.entries(packageBundles)) {
    const pending = [parse(bundle.code, { sourceType: "script" })];
    while (pending.length) {
      const value = pending.pop();
      if (!value || typeof value !== "object") continue;
      assert.ok(value.type !== "OptionalCallExpression" && value.type !== "OptionalMemberExpression" && !(value.type === "LogicalExpression" && value.operator === "??"), `${name} must be downleveled before the client compiler`);
      pending.push(...Object.values(value));
    }
  }
});
