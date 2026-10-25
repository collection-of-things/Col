import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { parse } from "@babel/parser";
import { runInNewContext } from "node:vm";
import { componentPreviewAssets, transformPreviewAssets } from "./component-preview-assets.ts";
import { verifyPassiveSvg, verifyPreviewAsset } from "../scripts/preview-asset-integrity.mjs";
import { findOriginalFlagTemplate } from "../scripts/preview-asset-sources.mjs";

const load = async name => JSON.parse(await readFile(new URL(`../data/component-previews/${name}.json`, import.meta.url), "utf8"));
const [snapshot, shadcn, extra] = await Promise.all([load("assets"), load("shadcn"), load("extra")]);

test("seven affected demos embed every original image with verified bytes and attribution", () => {
  const expected = { "shadcn-ui/Sidebar": 1, "shadcn-ui/Avatar": 3, "shadcn-ui/Attachment": 3, "shadcn-ui/Message": 2, "kibo-ui/Avatar Stack": 4, "elevenlabs-ui/Orb": 1, "reui/Data Grid": 20 };
  assert.deepEqual(Object.keys(snapshot.components).sort(), Object.keys(expected).sort());
  for (const [id, count] of Object.entries(expected)) {
    const recipe = shadcn.entries[id] ?? extra.entries[id];
    const provenance = componentPreviewAssets(id);
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
      assert.match(asset.mediaType, /^image\/(png|jpeg|svg\+xml)$/);
      assert.doesNotThrow(() => verifyPreviewAsset(recorded));
      assert.ok(asset.attribution.name && asset.attribution.license && asset.attribution.url);
      assert.ok(!("base64" in asset), "tool provenance does not duplicate embedded image bytes");
      if (!asset.url.startsWith("https://flagcdn.com/")) {
        assert.ok(recipe.code.includes(JSON.stringify(asset.url)), "image is present in the actual demo");
        assert.ok(!transformed.includes(JSON.stringify(asset.url)), "original literal is relocated");
      }
      assert.ok(transformed.includes(`data:${asset.mediaType};base64,${recorded.base64}`));
      restored = restored.replaceAll(JSON.stringify(`data:${asset.mediaType};base64,${recorded.base64}`), JSON.stringify(asset.url));
      if (asset.url.startsWith("/")) assert.ok(asset.downloadUrl.includes(`/${recipe.source.revision}/apps/v4/public${asset.url}`));
    }
    for (const template of snapshot.components[id].templates ?? []) {
      const start = restored.indexOf("((url) => (");
      const end = restored.indexOf(template.source + ")", start) + template.source.length + 1;
      assert.ok(start >= 0 && end > start);
      restored = restored.slice(0, start) + template.source + restored.slice(end);
    }
    assert.equal(restored, recipe.code, "every byte outside the image literals remains unchanged");
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

test("repository images retain upstream MIT notice while external assets keep distinct attribution", () => {
  assert.match(snapshot.licenses["shadcn-ui/ui"].text, /Copyright \(c\) 2023 shadcn/);
  assert.match(snapshot.assets["/avatars/02.png"].downloadUrl, /617134d5810bba521803b3ed787190bacbb80b35/);
  assert.equal(snapshot.assets["/avatars/02.png"].attribution.license, "MIT");
  assert.notEqual(snapshot.assets["https://github.com/shadcn.png"].attribution.license, "MIT");
});
