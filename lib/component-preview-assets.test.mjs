import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { parse } from "@babel/parser";
import { runInNewContext } from "node:vm";
import { componentPreviewAssets, transformPreviewAssets } from "./component-preview-assets.ts";
import { verifyPassiveSvg, verifyPreviewAsset, verifyWebmContainer, verifyWebpContainer, verifyMp3Frames, verifyMp4Container } from "../scripts/preview-asset-integrity.mjs";
import { findOriginalFlagTemplate, findOriginalPicsumTemplate, findOriginalPravatarTemplate, findOriginalUrlTemplate } from "../scripts/preview-asset-sources.mjs";

const load = async name => JSON.parse(await readFile(new URL(`../data/component-previews/${name}.json`, import.meta.url), "utf8"));
const [snapshot, shadcn, extra] = await Promise.all([load("assets"), load("shadcn"), load("extra")]);
const mediaSnapshot = await load("media");

test("affected demos embed their audited original assets with verified bytes and attribution", () => {
  const expected = {"shadcn-ui/Sidebar":1,"shadcn-ui/Avatar":3,"shadcn-ui/Attachment":3,"shadcn-ui/Message":2,"kibo-ui/Avatar Stack":4,"kibo-ui/Stories":4,"elevenlabs-ui/Orb":1,"magic-ui/Avatar Circles":6,"magic-ui/Backlight":1,"magic-ui/Blur Fade":9,"magic-ui/Lens":1,"magic-ui/Marquee":6,"magic-ui/Pixel Image":1,"magic-ui/Video Text":1,"cult-ui/Collab Toolbar":3,"cult-ui/Illustration Comment Bubble":1,"cult-ui/Mac Screen":2,"cult-ui/Minimal Card":1,"cult-ui/Shift Card":1,"cult-ui/Terminal Animation":1,"tween-ui/Flip Card":1,"tween-ui/Integration Hub":7,"reui/Kanban":7,"reui/Data Grid":20,"intent-ui/Combo Box":10,"elevenlabs-ui/Conversation":1,"magic-ui/Hero Video Dialog":2,"kibo-ui/Pill":2,"cult-ui/Dock":7,"cult-ui/Expandable":1,"cult-ui/Fluted Glass":5,"cult-ui/Hero Heatmap":2,"cult-ui/Hero Liquid Metal":2,"cult-ui/Bg Image Texture":5,"cult-ui/Youtube Video Player":12,"elevenlabs-ui/Audio Player":3,"kibo-ui/Reel":3,"magic-ui/Icon Cloud":25,"magic-ui/Dotted Map":2,"kibo-ui/Marquee":10,"cult-ui/Three D Carousel":14};
  assert.deepEqual(Object.keys(snapshot.components).sort(), Object.keys(expected).sort());
  for (const [id, count] of Object.entries(expected)) {
    const recipe = shadcn.entries[id] ?? extra.entries[id];
    const provenance = componentPreviewAssets(id).filter(asset => Object.hasOwn(snapshot.assets, asset.url));
    assert.equal(provenance.length, count);
    assert.equal(snapshot.components[id].revision, recipe.source.revision);
    const transformed = transformPreviewAssets(id, recipe.code);
    let restored = transformed;
    assert.doesNotThrow(() => parse(transformed, { sourceType: "module", plugins: ["jsx", "typescript"] }));
    for (const asset of provenance) {
      const recorded = snapshot.assets[asset.url];
      const bytes = Buffer.from(recorded.base64, "base64");
      assert.equal(bytes.length, asset.bytes);
      assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
      assert.match(asset.mediaType, /^(image\/(png|jpeg|gif|webp|svg\+xml)|video\/(webm|mp4)|audio\/mpeg)$/);
      assert.doesNotThrow(() => verifyPreviewAsset(recorded));
      assert.ok(asset.attribution.name && asset.attribution.license && asset.attribution.url);
      assert.ok(!("base64" in asset), "tool provenance does not duplicate embedded image bytes");
      if (!snapshot.components[id].templates?.some(template => template.assets.includes(asset.url))) {
        assert.ok(recipe.code.includes(JSON.stringify(asset.url)), "image is present in the actual demo");
        assert.ok(!transformed.includes(JSON.stringify(asset.url)), "original literal is relocated");
      }
      assert.ok(transformed.includes(`data:${asset.mediaType};base64,${recorded.base64}`));
      const literal = JSON.stringify(asset.url);
      // Distinct upstream URLs may serve identical bytes (two official audio
      // tracks do). Restore only this URL's original occurrence count.
      const occurrences = recipe.code.split(literal).length - 1;
      for (let index = 0; index < occurrences; index++) restored = restored.replace(JSON.stringify(`data:${asset.mediaType};base64,${recorded.base64}`), literal);
      if (asset.url.startsWith("/")) assert.ok(asset.downloadUrl.includes(`/${recipe.source.revision}/${id.startsWith("shadcn-ui/") ? "apps/v4" : "apps/www"}/public${asset.url}`));
    }
    for (const template of snapshot.components[id].templates ?? []) {
      const start = restored.indexOf("((url) => (");
      const end = restored.indexOf(template.source + ")", start) + template.source.length + 1;
      assert.ok(start >= 0 && end > start);
      restored = restored.slice(0, start) + template.source + restored.slice(end);
    }
    for (const url of mediaSnapshot.components[id]?.assets ?? []) {
      const asset = mediaSnapshot.assets[url];
      restored = restored.replace(`document.getElementById(${JSON.stringify(`col-media-${asset.sha256}`)}).textContent`, JSON.stringify(url));
    }
    assert.equal(restored, recipe.code, "every byte outside the asset literals remains unchanged");
  }
});

test("Data Grid retains dynamic country evaluation and original URL fallback", () => {
  const template = snapshot.components["reui/Data Grid"].templates[0].source;
  const { binding } = findOriginalFlagTemplate(extra.entries["reui/Data Grid"].code);
  const code = transformPreviewAssets("reui/Data Grid", `globalThis.result = ${template};`);
  for (const flag of ["us", "GB", "zz"]) {
    const scope = { [binding]: { original: { flag } } };
    runInNewContext(code, scope);
    const url = `https://flagcdn.com/${flag.toLowerCase()}.svg`;
    const asset = snapshot.assets[url];
    assert.equal(scope.result, asset ? `data:${asset.mediaType};base64,${asset.base64}` : url);
  }
  const unrelated = '`https://flagcdn.com/${country}.svg`';
  assert.equal(transformPreviewAssets("reui/Data Grid", `const image = ${unrelated};`), `const image = ${unrelated};`);
});

test("flag source discovery survives minifier renames while rejecting different expressions", () => {
  for (const binding of ["n", "a", "row"]) {
    const source = '`https://flagcdn.com/${' + binding + '.original.flag.toLowerCase()}.svg`';
    assert.deepEqual(findOriginalFlagTemplate(`const url = ${source};`), { binding, source });
  }
  for (const expression of ['row.flag.toLowerCase()', 'row.original.flag.toUpperCase()', 'row.original.flag.toLowerCase("x")']) {
    assert.throws(() => findOriginalFlagTemplate('const url = `https://flagcdn.com/${' + expression + '}.svg`;'));
  }
});

test("Blur Fade retains its original nine-photo sequence and unknown URL fallback", () => {
  const recipe = extra.entries["magic-ui/Blur Fade"];
  const { source, bindings } = findOriginalPicsumTemplate(recipe.code);
  const code = transformPreviewAssets("magic-ui/Blur Fade", `globalThis.result = ${source};`);
  for (const index of [0, 1, 8, 9]) {
    const width = index % 2 === 0 ? 800 : 600;
    const height = index % 2 === 0 ? 600 : 800;
    const scope = { [bindings.index]: index, [bindings.width]: width, [bindings.height]: height };
    runInNewContext(code, scope);
    const url = `https://picsum.photos/seed/${index + 1}/${width}/${height}`;
    const asset = snapshot.assets[url];
    assert.equal(scope.result, asset ? `data:${asset.mediaType};base64,${asset.base64}` : url);
  }
  for (const [original, changed] of [["length:9", "length:10"], ["?800:600", "?900:600"], ["%2===0", "%3===0"]]) {
    assert.notEqual(recipe.code.replace(original, changed), recipe.code);
    assert.throws(() => findOriginalPicsumTemplate(recipe.code.replace(original, changed)));
  }
});

test("Cult avatar mapping preserves name hashing and unknown avatar fallback", () => {
  const { source, binding } = findOriginalPravatarTemplate(extra.entries["cult-ui/Illustration Comment Bubble"].code);
  const code = transformPreviewAssets("cult-ui/Illustration Comment Bubble", `globalThis.result = ${source};`);
  for (const value of [12, -12, 0]) {
    const scope = { [binding]: value };
    runInNewContext(code, scope);
    const url = `https://i.pravatar.cc/48?img=${Math.abs(value) % 70 + 1}`;
    const asset = snapshot.assets[url];
    assert.equal(scope.result, asset ? `data:${asset.mediaType};base64,${asset.base64}` : url);
  }
  assert.throws(() => findOriginalPravatarTemplate(`const src = ${source.replace("%70", "%71")};`));
});

test("asset verification rejects changed bytes and active or networked SVG content", () => {
  const asset = snapshot.assets["https://flagcdn.com/us.svg"];
  assert.throws(() => verifyPreviewAsset({ ...asset, base64: Buffer.from("changed").toString("base64") }), /integrity mismatch/);
  for (const content of [
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>',
    '<svg xmlns="http://www.w3.org/2000/svg"><use href="https://example.com/a.svg#x"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><use href="&#35;local"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><style>@import url(https://example.com)</style></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg"><path fill="url(https://example.com)"/></svg>',
    '<!DOCTYPE svg><svg xmlns="http://www.w3.org/2000/svg"/>',
  ]) assert.throws(() => verifyPassiveSvg(content));
});

test("video snapshots require the original WebM EBML doctype and segment", () => {
  const bytes = Buffer.from(snapshot.assets["https://cdn.magicui.design/ocean-small.webm"].base64, "base64");
  assert.doesNotThrow(() => verifyWebmContainer(bytes));
  const wrongType = Buffer.from(bytes);
  wrongType.write("html", wrongType.indexOf(Buffer.from("webm")));
  assert.throws(() => verifyWebmContainer(wrongType), /doctype/);
  for (const invalid of [Buffer.from("<!doctype html>"), bytes.subarray(0, 10), Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0])]) {
    assert.throws(() => verifyWebmContainer(invalid), /WebM/);
  }
});

test("animated GIF snapshots reject malformed dimensions and trailers", () => {
  const asset = snapshot.assets["https://media.giphy.com/media/sIIhZliB2McAo/giphy.gif"];
  for (const corrupt of [bytes => bytes.writeUInt16LE(0, 6), bytes => { bytes[bytes.length - 1] = 0; }]) {
    const bytes = Buffer.from(asset.base64, "base64");
    corrupt(bytes);
    assert.throws(() => verifyPreviewAsset({ ...asset, base64: bytes.toString("base64"), sha256: createHash("sha256").update(bytes).digest("hex") }), /Invalid raster image/);
  }
});

test("asset rewriting changes only exact literals in audited component IDs", () => {
  const code = `// https://github.com/shadcn.png\nconst example = "https://github.com/shadcn.png"; const unrelated = "https://github.com/shadcn.png?size=42"; const text = "Image: https://github.com/shadcn.png";`;
  const actual = transformPreviewAssets("shadcn-ui/Avatar", code);
  assert.ok(actual.startsWith("// https://github.com/shadcn.png\n"));
  assert.ok(actual.includes('const unrelated = "https://github.com/shadcn.png?size=42"'));
  assert.ok(actual.includes('const text = "Image: https://github.com/shadcn.png"'));
  assert.equal(transformPreviewAssets("shadcn-ui/Button", code), code);
  assert.equal(transformPreviewAssets("__proto__", code), code);
  assert.deepEqual(componentPreviewAssets("__proto__"), []);
});

test("audited image templates preserve unknown values and reject altered expressions", () => {
  for (const id of ["magic-ui/Icon Cloud", "magic-ui/Dotted Map", "kibo-ui/Marquee", "cult-ui/Three D Carousel", "cult-ui/Youtube Video Player"]) {
    const template = snapshot.components[id].templates[0];
    const ast = parse(template.source, { sourceType: "module" }).program.body[0].expression;
    const parts = ast.quasis.map(part => part.value.cooked);
    const { binding } = findOriginalUrlTemplate(extra.entries[id].code, parts);
    const code = transformPreviewAssets(id, `globalThis.result = ${template.source};`);
    for (const value of ["unknown-upstream-value", template.assets[0].slice(parts[0].length).split(parts[1] || "?")[0]]) {
      const original = { [binding]: value };
      runInNewContext(`globalThis.result = ${template.source};`, original);
      const scope = { [binding]: value };
      runInNewContext(code, scope);
      const asset = snapshot.assets[original.result];
      assert.equal(scope.result, asset ? `data:${asset.mediaType};base64,${asset.base64}` : original.result);
    }
    assert.throws(() => findOriginalUrlTemplate(template.source.replaceAll("${" + binding + "}", "${" + binding + ".toUpperCase()}"), parts));
  }
});

test("bounded original WebP, MP4 and MP3 containers reject malformed structural headers", () => {
  const media = [
    ["image/webp", verifyWebpContainer], ["video/mp4", verifyMp4Container], ["audio/mpeg", verifyMp3Frames],
  ];
  for (const [mediaType, verify] of media) {
    const asset = Object.values(snapshot.assets).find(asset => asset.mediaType === mediaType);
    const bytes = Buffer.from(asset.base64, "base64");
    assert.doesNotThrow(() => verify(bytes));
    for (const invalid of [Buffer.from("<!doctype html>"), bytes.subarray(0, 12), Buffer.alloc(bytes.length)]) assert.throws(() => verify(invalid));
  }
  assert.doesNotThrow(() => verifyPassiveSvg('<svg xmlns="http://www.w3.org/2000/svg" role="img"><title>Original brand</title><path d="M0 0"/></svg>'));
  assert.throws(() => verifyPassiveSvg('<svg xmlns="http://www.w3.org/2000/svg"><title><path d="M0 0"/></title></svg>'));
  assert.throws(() => verifyPassiveSvg('<svg xmlns="http://www.w3.org/2000/svg" role="application"/>'));
});

test("repository images retain upstream MIT notice while external assets keep distinct attribution", () => {
  assert.match(snapshot.licenses["shadcn-ui/ui"].text, /Copyright \(c\) 2023 shadcn/);
  assert.match(snapshot.assets["/avatars/02.png"].downloadUrl, /617134d5810bba521803b3ed787190bacbb80b35/);
  assert.equal(snapshot.assets["/avatars/02.png"].attribution.license, "MIT");
  assert.notEqual(snapshot.assets["https://github.com/shadcn.png"].attribution.license, "MIT");
});
