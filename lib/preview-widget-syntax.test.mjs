import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { parse } from "@babel/parser";
import { init, parse as parseModule } from "es-module-lexer/js";
import { transform } from "sucrase";
import { createComponentPreview } from "./component-preview.ts";
import { mountable, preparePreviewSource, resolveImport, validatePreviewSyntax } from "./preview-widget.ts";

test("the actual Conversation dependency graph passes the client's syntax and compilation pipeline", async () => {
  const preview = createComponentPreview({ id: "elevenlabs-ui/Conversation" }, "https://ui.elevenlabs.io/docs/components/conversation");
  assert.ok(preview.available);
  // Babel's TypeScript mode loses the final export binding in this valid emitted
  // JavaScript graph. Keep the real package graph as the regression fixture.
  const prepared = preparePreviewSource(preview.code, parse, () => { throw new Error("Emitted JavaScript must not be compiled again"); }, validatePreviewSyntax);
  assert.equal(prepared.js, preview.code);
  assert.equal(prepared.written, preview.code);
  await init();
  const [, exports] = parseModule(prepared.js);
  const declaration = exports.find(entry => entry.name === "default");
  assert.ok(declaration);
  assert.doesNotThrow(() => parse(mountable(prepared.js, declaration), { sourceType: "module" }));
});

test("JSX and TypeScript retain compilation and written-import validation", async () => {
  await init();
  for (const source of ['export default () => <p>JSX</p>', 'import { ReactNode } from "react"; const label: ReactNode = "TSX"; export default () => <p>{label}</p>']) {
    const prepared = preparePreviewSource(source, parse, transform, validatePreviewSyntax);
    assert.notEqual(prepared.js, source);
    assert.doesNotThrow(() => parse(prepared.js, { sourceType: "module" }));
    if (source.includes("ReactNode")) {
      assert.doesNotMatch(prepared.js, /import \{ ReactNode \}/);
      assert.ok(parseModule(prepared.written)[0].some(entry => entry.specifier === "react"));
    }
  }
});

test("source preparation remains self-contained when embedded in the client", () => {
  const embedded = runInNewContext(`(${preparePreviewSource.toString()})`);
  const source = "export default function Component() { return null; }";
  const result = embedded(source, parse, () => { throw new Error("Unexpected compilation"); }, validatePreviewSyntax);
  assert.equal(result.js, source);
  assert.equal(result.written, source);
});

test("plain JavaScript preserves blocked and computed imports for the unchanged import gate", async () => {
  await init();
  for (const specifier of ["node:fs", "file:///secret", "./local.js", "server-only"]) {
    const source = `import ${JSON.stringify(specifier)}; export default function Component() { return null; }`;
    const prepared = preparePreviewSource(source, parse, () => { throw new Error("Unexpected compilation"); }, validatePreviewSyntax);
    const [entry] = parseModule(prepared.written)[0];
    assert.equal(entry.specifier, specifier);
    assert.throws(() => resolveImport(entry.specifier, "19.3.0"));
  }
  const source = 'const target = "react"; import(target); export default function Component() { return null; }';
  const prepared = preparePreviewSource(source, parse, transform, validatePreviewSyntax);
  assert.equal(parseModule(prepared.written)[0][0].specifier, undefined);
  for (const malformed of ['const = 1;', 'export { Missing as default };', 'export default function Component( { return null; }']) assert.throws(() => preparePreviewSource(malformed, parse, transform, validatePreviewSyntax), /Invalid TSX/);
});

test("strict syntax validation accepts TypeScript without weakening JSX or module checks", () => {
  assert.doesNotThrow(() => validatePreviewSyntax('const label: string = "ok"; export default () => <p>{label}</p>', parse));
  for (const code of [
    'export default () => <main><span /></div>',
    'const label: string = "private-marker"; export default () => <main>{label}</div>',
    'const label: = "private-marker"; export default () => <p>{label}</p>',
    'export { MissingComponent as default };',
  ]) {
    assert.throws(() => validatePreviewSyntax(code, parse), error => {
      assert.match(error.message, /Invalid TSX at line \d+, column \d+/);
      assert.doesNotMatch(error.message, /private-marker/);
      return true;
    });
  }
});
