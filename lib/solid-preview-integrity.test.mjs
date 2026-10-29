import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { parse } from "es-module-lexer/js";

const slugs = ["kobalte", "solid-ui", "shadcn-solid", "zaidan", "hope-ui", "rocksolid", "nikala-ui", "torch-ui", "magicui-solid", "mystic-ui"];
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const clean = value => value.replace(/^sha256:/, "");
const json = async url => JSON.parse(await readFile(url, "utf8"));

test("every shipped Solid preview retains authenticated source, styling, closed imports, and license notices", async t => {
  for (const slug of slugs) {
    await t.test(slug, async () => {
      const root = new URL(`../data/solid-libraries/${slug}/`, import.meta.url);
      const artifact = await json(new URL(`../data/component-previews/solid/${slug}.json`, import.meta.url));
      const catalog = await json(new URL("catalog.json", root));
      const corpus = await json(new URL("corpus.json", root));
      const lock = await readFile(new URL("package-lock.json", root));
      const upstream = ["nikala-ui", "magicui-solid", "mystic-ui"].includes(slug) ? await json(new URL("upstream.json", root)) : undefined;
      let proof;
      if (slug === "kobalte") proof = Object.fromEntries(artifact.evidence.map(({ id, integrity, ...rest }) => [id, { codeIntegrity: integrity, ...rest }]));
      else if (["solid-ui", "shadcn-solid", "zaidan"].includes(slug)) proof = (await json(new URL("build-evidence.json", root))).entries;
      else if (["hope-ui", "rocksolid", "torch-ui"].includes(slug)) {
        const manifest = await json(new URL("build-manifest.json", root));
        proof = Object.fromEntries(Object.entries(manifest).map(([name, item]) => [`${slug}/${name}`, item]));
      } else proof = (await json(new URL("build.json", root))).records;

      assert.equal(catalog.library.slug, slug);
      assert.equal(corpus.permission.status, "granted");
      assert.deepEqual(Object.keys(artifact.entries).sort(), catalog.components.map(component => `${slug}/${component.name}`).sort());
      for (const [id, entry] of Object.entries(artifact.entries)) {
        assert.equal(digest(entry.code), clean(proof[id].codeIntegrity), `${id}: bundled code changed`);
        assert.equal(digest(entry.css), clean(proof[id].cssIntegrity), `${id}: compiled CSS changed`);
        assert.equal(digest(lock), clean(proof[id].lockIntegrity), `${id}: locked dependencies changed`);
        assert.ok(artifact.sources.some(source => source.url === entry.source.url && clean(source.integrity) === clean(entry.source.integrity)), `${id}: missing pinned upstream source`);
        const [imports, exports] = parse(entry.code);
        assert.equal(imports.length, 0, `${id}: runtime imports must be bundled`);
        assert.ok(exports.some(item => item.name === "default"), `${id}: missing Solid mount export`);
        assert.ok(artifact.notices.some(notice => notice.text?.trim() && entry.code.includes(notice.text.trim().replaceAll("*/", "* /"))), `${id}: no bundled license notice`);
        assert.ok(corpus.snapshots.some(snapshot => snapshot.componentId === id), `${id}: missing source-linked component evidence`);
        for (const asset of entry.assets ?? []) {
          const original = upstream?.assets[asset.url];
          assert.ok(original, `${id}: asset source was not recorded`);
          const bytes = Buffer.from(original.dataUrl.split(",")[1], "base64");
          assert.equal(digest(bytes), asset.sha256, `${id}: asset hash changed`);
          assert.equal(bytes.length, asset.bytes, `${id}: asset size changed`);
          assert.ok(entry.code.includes(original.dataUrl) || entry.css.includes(original.dataUrl), `${id}: disclosed asset is not rendered`);
        }
      }
    });
  }
});

test("all retained upstream source snapshots match their reviewed hashes", async t => {
  for (const slug of slugs) {
    await t.test(slug, async () => {
      const root = new URL(`../data/solid-libraries/${slug}/`, import.meta.url);
      if (["hope-ui", "rocksolid", "torch-ui"].includes(slug)) {
        const snapshot = await json(new URL("provenance.json", root));
        for (const file of snapshot.sources) assert.equal(digest(await readFile(new URL(file.path, root))), clean(file.integrity), `${slug}/${file.path}`);
      } else {
        const snapshot = await json(new URL(slug === "kobalte" || ["solid-ui", "shadcn-solid", "zaidan"].includes(slug) ? "sources.json" : "upstream.json", root));
        const files = Array.isArray(snapshot.files) ? snapshot.files : Object.values(snapshot.files);
        for (const file of files) {
          const bytes = file.base64 ? Buffer.from(file.base64, "base64") : Buffer.from(file.content);
          assert.equal(digest(bytes), clean(file.integrity), `${slug}: ${file.url}`);
        }
        for (const [url, asset] of Object.entries(snapshot.assets ?? {})) {
          assert.equal(digest(Buffer.from(asset.dataUrl.split(",")[1], "base64")), clean(asset.integrity), `${slug}: ${url}`);
        }
      }
    });
  }
});
