import test from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { containedPath, dynamicAssetUrls } from "./motion-build-inputs.mjs";

test("motion source writes and asset reads reject resolved paths outside their root", () => {
  const root = resolve(".scratch/solid-library-69/solid-motion/build/source");
  assert.equal(containedPath(root, "demos/accordion.tsx"), resolve(root, "demos/accordion.tsx"));
  assert.equal(containedPath(root, resolve(root, "assets/photo.webp")), resolve(root, "assets/photo.webp"));
  for (const path of ["../outside.ts", "demos/../../outside.ts", resolve(root, "../source-other/photo.webp"), root]) {
    assert.throws(() => containedPath(root, path), /escapes its intended root/);
  }
});

test("media variables and JSX attributes retain dynamic literal URLs for sandbox relocation", () => {
  const url = "https://example.test/photo?a=1&b=2";
  const input = `const IMAGE_URL = '${url}'; export const Demo = () => <><img src={IMAGE_URL}/><video src="${url}"/></>;`;
  const output = dynamicAssetUrls(input, "demo.tsx", new Set([url]));
  assert.ok(output.includes(`const IMAGE_URL = window.String(${JSON.stringify(url)})`));
  assert.ok(output.includes(`src={window.String(${JSON.stringify(url)})}`));
  assert.equal(dynamicAssetUrls(output, "demo.tsx", new Set([url])), output);
});
