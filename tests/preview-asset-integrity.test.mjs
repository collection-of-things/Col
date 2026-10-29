import assert from "node:assert/strict";
import test from "node:test";
import { verifyPassiveSvg } from "../scripts/preview-asset-integrity.mjs";

const xmlns = `xmlns="http://www.w3.org/2000/svg"`;

test("verifyPassiveSvg parses long attribute whitespace runs in bounded time", { timeout: 10_000 }, () => {
  const padding = " ".repeat(1_500_000);
  verifyPassiveSvg(`<svg ${xmlns} viewBox="0 0 1 1"${padding}><title>ok</title></svg>`);
});

test("verifyPassiveSvg still accepts and rejects the same attribute syntax", () => {
  verifyPassiveSvg(`<svg ${xmlns} viewBox="0 0 10 10" fill='none'><path d="M0 0h10v10z"/></svg>`);
  verifyPassiveSvg(`<svg ${xmlns} viewBox="0 0 1 1" />`);
  assert.throws(() => verifyPassiveSvg(`<svg ${xmlns} onclick="run()"></svg>`), /Unsupported SVG attribute/);
  assert.throws(() => verifyPassiveSvg(`<svg ${xmlns} viewBox=0></svg>`), /Invalid SVG attribute syntax/);
  assert.throws(() => verifyPassiveSvg(`<svg ${xmlns} bogus></svg>`), /Invalid SVG attribute syntax/);
});
