import assert from "node:assert/strict";
import { test } from "node:test";
import { brotliCompressSync } from "node:zlib";
import { createHash } from "node:crypto";
import { decodeSolidPreviewArtifact, expandSolidPreviewArtifact, solidPreviews, solidUnavailable } from "../data/component-previews/solid/index.ts";
import { componentPreviewSupport, createComponentPreview } from "./component-preview.ts";

const metadata = { package: "example", version: "1", runtimeVersion: "1", exportName: "Demo", source: { url: "https://example.test/source", revision: "1", integrity: "a" }, gaps: [] };

test("packed Solid artifacts restore their exact generated data", () => {
  const artifact = { entries: { "example/Direct": { ...metadata, code: "export default () => {}", css: "body { color: red }" } } };
  const packed = { encoding: "br", data: brotliCompressSync(JSON.stringify(artifact)).toString("base64") };
  assert.deepEqual(decodeSolidPreviewArtifact(packed), artifact);
  assert.throws(() => decodeSolidPreviewArtifact({ ...packed, encoding: "unknown" }), /Unsupported/);
});

test("packed shared assets are authenticated before their original bytes are restored", () => {
  const bytes = Buffer.from("verified image bytes");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const url = "https://example.test/image.png";
  const dataUrl = `data:image/png;base64,${bytes.toString("base64")}`;
  const artifact = { entries: { "example/Image": { ...metadata, code: `const src = "__COL_ORIGINAL_ASSET_${sha256}__"`, css: "body {}" } } };
  const packed = { encoding: "br", data: brotliCompressSync(JSON.stringify(artifact)).toString("base64"), assetReferences: [{ url, sha256 }] };
  const assets = { [url]: { sha256, bytes: bytes.length, dataUrl } };
  assert.ok(decodeSolidPreviewArtifact(packed, assets).entries["example/Image"].code.includes(dataUrl));
  assert.throws(() => decodeSolidPreviewArtifact(packed), /Invalid packed/);
  assert.throws(() => decodeSolidPreviewArtifact(packed, { [url]: { ...assets[url], bytes: 0 } }), /integrity mismatch/);
});

test("grouped previews reuse their verified module and stylesheet without changing direct previews", () => {
  const result = expandSolidPreviewArtifact({
    styles: { main: ".demo { color: blue }" },
    groups: { controls: { code: "export default () => {}", style: "main" } },
    entries: { "example/Grouped": { ...metadata, group: "controls" }, "example/Direct": { ...metadata, code: "direct", css: "direct style" } },
  });
  assert.equal(result["example/Grouped"].code, "export default () => {}");
  assert.equal(result["example/Grouped"].css, ".demo { color: blue }");
  assert.equal(result["example/Direct"].code, "direct");
  assert.equal(result["example/Direct"].css, "direct style");
  assert.equal(expandSolidPreviewArtifact({ entries: { "example/Missing": { ...metadata, group: "missing" } } })["example/Missing"].code, "");
  assert.equal(expandSolidPreviewArtifact({ entries: { "example/Missing": { ...metadata, group: "controls" } }, groups: { controls: { code: "code", style: "missing" } } })["example/Missing"].css, "");
});

test("Solid preview modules receive their complete, safely serialized component ID", () => {
  const preview = createComponentPreview({ id: "kobalte/Button", theme: "light" }, "https://kobalte.dev/docs/core/components/button");
  assert.equal(preview.available, true);
  assert.match(preview.code, /const PREVIEW_COMPONENT = "kobalte\/Button";/);
});

test("a documented but blocked Solid preview exposes its specific reason", () => {
  solidUnavailable["example/Native"] = { reason: "Requires a native desktop host.", gaps: ["The browser sandbox does not supply it."] };
  try {
    const result = componentPreviewSupport("example/Native");
    assert.equal(result.available, false);
    assert.deepEqual(result.gaps, ["Requires a native desktop host.", "The browser sandbox does not supply it."]);
  } finally { delete solidUnavailable["example/Native"]; }
});

test("a missing shared bundle is unavailable without breaking other previews", () => {
  const entry = solidPreviews["kobalte/Accordion"];
  const code = entry.code;
  try {
    entry.code = "";
    assert.equal(componentPreviewSupport("kobalte/Accordion").available, false);
    assert.equal(componentPreviewSupport("kobalte/Button").available, true);
  } finally { entry.code = code; }
});
