import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import sharp from "sharp";
import { page } from "./site.mjs";

test("brand assets are wired into the built site and favicon entries decode at their declared sizes", async () => {
  const html = await page("/");
  for (const asset of ["/brand/col-mark.svg", "/favicon.ico", "/icon.svg", "/apple-icon.png"]) {
    assert.ok(html.includes(asset), `Missing ${asset} in the built homepage`);
  }
  assert.equal(html.includes("/brand/col-mark.png"), false);

  const ico = readFileSync("public/favicon.ico");
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  for (const [index, size] of [16, 32, 48].entries()) {
    const entry = 6 + index * 16;
    const length = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    assert.equal(ico[entry], size);
    const decoded = await sharp(ico.subarray(offset, offset + length)).metadata();
    assert.equal(decoded.width, size);
    assert.equal(decoded.height, size);
  }
});
