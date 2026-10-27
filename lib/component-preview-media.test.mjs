import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { componentPreviewAssets, componentPreviewMedia, readPreviewMediaChunk, transformPreviewAssets } from "./component-preview-assets.ts";
import { previewMediaHtml, previewFragmentHtml, resolvePreviewMedia } from "./preview-widget.ts";

const snapshot = JSON.parse(await readFile(new URL("../data/component-previews/media.json", import.meta.url), "utf8"));
const entries = JSON.parse(await readFile(new URL("../data/component-previews/extra.json", import.meta.url), "utf8")).entries;

test("large media retains exact original bytes and URL-only relocation outside executable source", async () => {
  for (const [id, component] of Object.entries(snapshot.components)) {
    const original = entries[id];
    assert.equal(component.revision, original.source.revision);
    assert.equal(component.integrity, original.source.integrity);
    let restored = transformPreviewAssets(id, original.code);
    for (const url of component.assets) {
      const asset = snapshot.assets[url];
      const bytes = await readFile(new URL(`../data/component-previews/media/${asset.file}`, import.meta.url));
      assert.equal(bytes.length, asset.bytes);
      assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
      const expression = `document.getElementById(${JSON.stringify(`col-media-${asset.sha256}`)}).textContent`;
      assert.ok(restored.includes(expression));
      restored = restored.replace(expression, JSON.stringify(url));
      assert.ok(componentPreviewAssets(id).some(item => item.sha256 === asset.sha256 && !("base64" in item)));
      assert.ok(transformPreviewAssets(id, `const media = ${JSON.stringify(url)};`).length < 200, "media bytes must not enter executable source");
    }
    if (id !== "elevenlabs-ui/Audio Player") assert.equal(restored, original.code, "only original URL literals changed");
  }
});

test("selected media is verified in bounded resource reads and embedded as inert data", async () => {
  const id = "cult-ui/Bg Media";
  const media = componentPreviewMedia(id);
  const asset = snapshot.assets[snapshot.components[id].assets[0]];
  assert.deepEqual(Object.keys(media), [asset.sha256]);
  const resolved = await resolvePreviewMedia(media, uri => readPreviewMediaChunk(...uri.slice("col://preview-media/".length).split("/")), () => true);
  assert.equal(Buffer.from(resolved[asset.sha256].split(",")[1], "base64").length, asset.bytes);
  assert.equal(createHash("sha256").update(Buffer.from(resolved[asset.sha256].split(",")[1], "base64")).digest("hex"), asset.sha256);
  const passive = previewMediaHtml(resolved);
  assert.ok(passive.startsWith('<script type="application/octet-stream"'));
  const html = previewFragmentHtml("export default function Demo() { return null; }", true, resolved);
  const page = html.match(/srcdoc="([\s\S]*?)" style=/)[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&");
  assert.ok(page.indexOf("application/octet-stream") < page.indexOf("</head>"), "passive media is available before runtime starts");
  assert.deepEqual(componentPreviewMedia("__proto__"), {});
  assert.throws(() => previewMediaHtml({ [asset.sha256]: '</script><script>alert(1)</script>' }), /Invalid verified media/);
  assert.throws(() => previewMediaHtml({ invalid: resolved[asset.sha256] }), /Invalid verified media/);
});

test("media chunks reject invalid paths, corruption, oversized responses and stale input", async () => {
  const [sha, descriptor] = Object.entries(componentPreviewMedia("kibo-ui/Video Player"))[0];
  const first = await readPreviewMediaChunk(sha, "0");
  assert.equal(first.length, 2_000_000);
  for (const [hash, part] of [["../secret", "0"], [sha, "-1"], [sha, "01"], [sha, "1.5"], [sha, "99999999"]]) await assert.rejects(readPreviewMediaChunk(hash, part), /Unknown original/);
  await assert.rejects(resolvePreviewMedia({ [sha]: descriptor }, async () => "AAAA", () => true), /Truncated/);
  await assert.rejects(resolvePreviewMedia({ [sha]: descriptor }, async () => Buffer.alloc(1_500_000).toString("base64"), () => true), /integrity mismatch/);
  await assert.rejects(resolvePreviewMedia({ [sha]: descriptor }, async () => "A".repeat(2_000_001), () => true), /response budget/);
  let current = true;
  assert.equal(await resolvePreviewMedia({ [sha]: descriptor }, async () => { current = false; return first; }, () => current), undefined);
});
