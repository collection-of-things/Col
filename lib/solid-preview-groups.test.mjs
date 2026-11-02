import assert from "node:assert/strict";
import { test } from "node:test";
import { brotliCompressSync, brotliDecompressSync } from "node:zlib";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { decodeSolidPreviewArtifact, expandSolidPreviewArtifact, solidPreviews, solidUnavailable } from "../data/component-previews/solid/index.ts";
import { componentPreviewSupport, createComponentPreview } from "./component-preview.ts";

const metadata = { package: "example", version: "1", runtimeVersion: "1", exportName: "Demo", source: { url: "https://example.test/source", revision: "1", integrity: "a" }, gaps: [] };

test("packed Solid artifacts restore their exact generated data", () => {
  const artifact = { entries: { "example/Direct": { ...metadata, code: "export default () => {}", css: "body { color: red }" } } };
  const packed = { encoding: "br", data: brotliCompressSync(JSON.stringify(artifact)).toString("base64") };
  assert.deepEqual(decodeSolidPreviewArtifact(packed), artifact);
  assert.throws(() => decodeSolidPreviewArtifact({ ...packed, encoding: "unknown" }), /Unsupported/);
});

test("packed baseline artifacts retain their original bytes", async () => {
  const originals = {
    "kobalte": "90d6c0fd04ea62c37eb7615d686079f3f964c41b402ff0014c3b22edcb7dbf25",
    "solid-ui": "91d5e3bd0af3ca68dd7b3cc09d79d2c58de459bcdec153d19ebbc2f7e68ec21b",
    "shadcn-solid": "9a1b5aa5260f6596738123332f2033c754aa9ca7d319dee36616dca06497c486",
    "zaidan": "3a9f5ab73d9ae7705736381e7e8c822b0f1e8e6ffbf796357e128365c8ee3ad7",
    "hope-ui": "4e0ade19bd7471b9862f13b3740af41d5abc50d6aed424a9f2ffe5e54d1c6a70",
    "rocksolid": "c033de5ce40a52b268a388f20a0381431736dadb0fd52e421aebac29ff200a27",
    "nikala-ui": "3d93fcf7b2347235071f2204ef74c2ad3ad3cd4d517783231c0753c92c3eff14",
    "torch-ui": "645535157259f288145eb5178c50d0e913209fedaf4677301574feecc37905f6",
    "magicui-solid": "d3087e28fcd26e706f34a0055813b07685801b7770ec0c44622a6b54fb9b7636",
    "mystic-ui": "3c93b9136629f468426a1749543f4266c8629221532bddc7ebc79eb172e3f1a3",
  };
  for (const [slug, expected] of Object.entries(originals)) {
    const file = new URL(`../data/component-previews/solid/${slug}.json`, import.meta.url);
    const packed = JSON.parse(await readFile(file, "utf8"));
    assert.equal(packed.encoding, "br", slug);
    assert.equal(createHash("sha256").update(brotliDecompressSync(Buffer.from(packed.data, "base64"))).digest("hex"), expected, slug);
  }
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
