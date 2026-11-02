import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { JSDOM } from "jsdom";
import { canInlinePreviewMedia, componentPreviewAssets, componentPreviewMedia, inlinePreviewMedia, readPreviewMediaChunk, transformPreviewAssets } from "./component-preview-assets.ts";
import { createComponentPreview } from "./component-preview.ts";
import { previewMediaHtml, previewFragmentHtml, resolvePreviewMedia, verifiedPreviewFragmentHtml } from "./preview-widget.ts";
import sharedAssets from "../data/component-previews/solid/magicui-solid/shared-assets.json" with { type: "json" };

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

test("TorchUI discloses its film-frame poster and verified video derivative", async () => {
  const inline = JSON.parse(await readFile(new URL("../data/component-previews/solid/torch-ui/assets.json", import.meta.url), "utf8"));
  const media = JSON.parse(await readFile(new URL("../data/component-previews/solid/torch-ui/media.json", import.meta.url), "utf8"));
  assert.equal(media.chunkSize, snapshot.chunkSize);
  for (const id of ["torch-ui/Image", "torch-ui/Video"]) {
    const preview = createComponentPreview({ id }, "https://torch-ui.dev/");
    assert.equal(preview.available, true);
    for (const url of inline.components[id].assets) {
      const asset = inline.assets[url];
      const bytes = Buffer.from(asset.base64, "base64");
      assert.equal(bytes.length, asset.bytes);
      assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
      assert.ok(preview.assets.some(item => item.sha256 === asset.sha256));
      assert.ok(preview.code.includes(`data:${asset.mediaType};base64,${asset.base64}`));
    }
  }
  const id = "torch-ui/Video";
  const asset = media.assets[media.components[id].assets[0]];
  const poster = inline.assets[inline.components[id].assets[0]];
  assert.equal(poster.original.sha256, asset.original.sha256);
  assert.match(poster.transformation, /replaces the documented poster/);
  const descriptor = componentPreviewMedia(id);
  const resolved = await resolvePreviewMedia(descriptor, uri => readPreviewMediaChunk(...uri.slice("col://preview-media/".length).split("/")), () => true);
  const bytes = Buffer.from(resolved[asset.sha256].split(",")[1], "base64");
  assert.equal(bytes.length, asset.bytes);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
  const preview = createComponentPreview({ id }, "https://torch-ui.dev/");
  assert.ok(preview.code.includes(`col-media-${asset.sha256}`));
  assert.ok(preview.assets.some(item => item.sha256 === asset.sha256 && item.original && item.transformation));
  const disclosure = verifiedPreviewFragmentHtml(preview);
  const document = new JSDOM(disclosure).window.document;
  const text = document.body.textContent;
  assert.ok(text.includes(asset.original.sha256) && text.includes(asset.transformation));
  assert.ok(text.includes(poster.transformation));
  assert.ok(text.includes(poster.url));
  const links = [...document.querySelectorAll("[data-col-provenance] a")];
  const posterRow = [...document.querySelectorAll("[data-col-provenance] li")].find(item => item.textContent.includes(poster.url));
  assert.ok(posterRow);
  assert.ok([...posterRow.querySelectorAll("a")].some(link => link.href === poster.downloadUrl && link.textContent === poster.downloadUrl));
  assert.equal(links.filter(link => link.href === "https://creativecommons.org/licenses/by/4.0/").length, 2);
  assert.equal(canInlinePreviewMedia(id), true);
  const fallback = createComponentPreview({ id, format: "html" }, "https://torch-ui.dev/");
  assert.equal(fallback.available, true);
  assert.ok(verifiedPreviewFragmentHtml(fallback, inlinePreviewMedia(id)).includes(resolved[asset.sha256]));
});

test("MagicUI Backlight delivers its disclosed video excerpt through verified chunks", async () => {
  const snapshot = JSON.parse(await readFile(new URL("../data/component-previews/solid/magicui-solid/resource-media.json", import.meta.url), "utf8"));
  const id = "magicui-solid/Backlight";
  const asset = snapshot.assets[snapshot.components[id].assets[0]];
  const media = componentPreviewMedia(id);
  const resolved = await resolvePreviewMedia(media, uri => readPreviewMediaChunk(...uri.slice("col://preview-media/".length).split("/")), () => true);
  const bytes = Buffer.from(resolved[asset.sha256].split(",")[1], "base64");
  assert.equal(bytes.length, asset.bytes);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
  const preview = createComponentPreview({ id }, "https://axuj.github.io/magicui-solid/");
  assert.ok(preview.code.includes(`col-media-${asset.sha256}`));
  assert.ok(preview.assets.some(item => item.sha256 === asset.sha256));
  const disclosure = verifiedPreviewFragmentHtml(preview);
  const text = new JSDOM(disclosure).window.document.body.textContent;
  assert.ok(text.includes(asset.original.sha256) && text.includes(asset.transformation));
  assert.equal(canInlinePreviewMedia(id), true);
  const fallback = createComponentPreview({ id, format: "html" }, "https://axuj.github.io/magicui-solid/");
  assert.equal(fallback.available, true);
  assert.ok(verifiedPreviewFragmentHtml(fallback, inlinePreviewMedia(id)).includes(resolved[asset.sha256]));
});

test("MagicUI Video Text reuses the authenticated original WebM with its own attribution", async () => {
  const snapshot = JSON.parse(await readFile(new URL("../data/component-previews/assets.json", import.meta.url), "utf8"));
  const references = JSON.parse(await readFile(new URL("../data/component-previews/solid/magicui-solid/shared-assets.json", import.meta.url), "utf8"));
  const id = "magicui-solid/Video Text";
  const url = references.components[id].assets[0];
  const asset = snapshot.assets[url];
  assert.equal(asset.mediaType, "video/webm");
  assert.equal(asset.sha256, references.assets[url].sha256);
  const bytes = Buffer.from(asset.base64, "base64");
  assert.equal(bytes.length, asset.bytes);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
  const preview = createComponentPreview({ id, format: "html" }, "https://axuj.github.io/magicui-solid/");
  assert.equal(preview.available, true);
  assert.ok(preview.code.includes(`data:video/webm;base64,${asset.base64}`));
  assert.match(preview.code, /CodePen public Pen QvvEYQ, created 2017\. Video uploader: Dudley Storey \(user 4273\)/);
  assert.deepEqual(preview.assets.find(item => item.url === url).attribution, references.assets[url].attribution);
  assert.deepEqual(componentPreviewAssets("magic-ui/Video Text").find(item => item.url === url).attribution, asset.attribution);
  assert.match(verifiedPreviewFragmentHtml(preview), /sandbox="allow-scripts allow-forms"/);
});

test("a corrupt shared asset only blocks its owning preview", () => {
  const url = sharedAssets.components["magicui-solid/Video Text"].assets[0];
  const reference = sharedAssets.assets[url];
  const original = reference.sha256;
  reference.sha256 = "0".repeat(64);
  try {
    assert.throws(() => componentPreviewAssets("magicui-solid/Video Text"), /Shared preview asset integrity mismatch/);
    assert.doesNotThrow(() => componentPreviewAssets("magic-ui/Video Text"));
    assert.doesNotThrow(() => componentPreviewAssets("magicui-solid/Marquee"));
  } finally {
    reference.sha256 = original;
  }
});

test("MagicUI Lens and Pixel Image use their verified converted assets", async () => {
  const snapshot = JSON.parse(await readFile(new URL("../data/component-previews/solid/magicui-solid/assets.json", import.meta.url), "utf8"));
  for (const id of ["magicui-solid/Lens", "magicui-solid/Pixel Image"]) {
    const preview = createComponentPreview({ id }, "https://axuj.github.io/magicui-solid/");
    assert.equal(preview.available, true, id);
    for (const url of snapshot.components[id].assets) {
      const asset = snapshot.assets[url];
      const bytes = Buffer.from(asset.base64, "base64");
      assert.equal(bytes.length, asset.bytes);
      assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
      assert.ok(preview.code.includes(`data:${asset.mediaType};base64,${asset.base64}`), id);
      assert.ok(preview.assets.some(item => item.sha256 === asset.sha256 && item.original && item.transformation), id);
    }
  }
});

test("React and Solid Lens previews retain their own bytes for a shared source URL", async () => {
  const original = JSON.parse(await readFile(new URL("../data/component-previews/assets.json", import.meta.url), "utf8"));
  const solid = JSON.parse(await readFile(new URL("../data/component-previews/solid/magicui-solid/assets.json", import.meta.url), "utf8"));
  const url = original.components["magic-ui/Lens"].assets[0];
  assert.equal(solid.components["magicui-solid/Lens"].assets[0], url);
  for (const [id, snapshot] of [["magic-ui/Lens", original], ["magicui-solid/Lens", solid]]) {
    const asset = snapshot.assets[url];
    const preview = createComponentPreview({ id }, "https://example.com/");
    assert.equal(preview.assets.find(item => item.url === url).sha256, asset.sha256, id);
    assert.ok(preview.code.includes(`data:${asset.mediaType};base64,${asset.base64}`), id);
  }
  assert.notEqual(original.assets[url].sha256, solid.assets[url].sha256);
  const react = createComponentPreview({ id: "magic-ui/Lens" }, "https://example.com/");
  assert.ok(react.gaps.some(gap => gap.includes("Escape can immediately reopen")));
});
