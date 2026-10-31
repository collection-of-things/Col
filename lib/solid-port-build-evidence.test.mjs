import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { decodeSolidPreviewArtifact } from "../data/component-previews/solid/packed.ts";

const digest = value => `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
const json = async url => JSON.parse(await readFile(url, "utf8"));

test("Solid port groups retain their authenticated input and package evidence", async t => {
  for (const slug of ["solid-ui", "shadcn-solid", "zaidan"]) {
    await t.test(slug, async () => {
      const root = new URL(`../data/solid-libraries/${slug}/`, import.meta.url);
      const evidence = await json(new URL("build-evidence.json", root));
      const lock = await json(new URL("package-lock.json", root));
      const referencedInputs = new Set();
      const referencedPackages = new Set();
      for (const [name, group] of Object.entries(evidence.groups)) {
        const inputs = group.inputs.map(index => {
          assert.ok(Number.isInteger(index) && index >= 0 && index < evidence.inputs.length, `${name}: invalid input reference`);
          referencedInputs.add(index);
          return evidence.inputs[index];
        });
        for (const input of inputs) {
          assert.ok(input.path, `${name}: missing input path`);
          assert.match(input.sha256, /^[a-f0-9]{64}$/, `${name}: invalid input hash`);
        }
        assert.equal(digest(inputs), group.inputsIntegrity, `${name}: input graph changed`);
        const packages = Object.fromEntries(group.packages.map(path => {
          const record = evidence.packages[path];
          assert.ok(record, `${name}: missing package ${path}`);
          assert.deepEqual(record, lock.packages[path], `${name}: package ${path} differs from the lock`);
          referencedPackages.add(path);
          return [path, record];
        }));
        assert.equal(digest(packages), group.packagesIntegrity, `${name}: package graph changed`);
      }
      assert.equal(referencedInputs.size, evidence.inputs.length, "unreferenced input evidence");
      assert.equal(referencedPackages.size, Object.keys(evidence.packages).length, "unreferenced package evidence");
      for (const [id, entry] of Object.entries(evidence.entries)) {
        assert.ok(evidence.groups[entry.group], `${id}: missing group evidence`);
        assert.match(entry.source.integrity, /^sha256:[a-f0-9]{64}$/, `${id}: invalid source hash`);
      }
    });
  }
});

test("packed Solid port artifacts decode to their authenticated previews", async t => {
  for (const slug of ["solid-ui", "shadcn-solid", "zaidan"]) {
    await t.test(slug, async () => {
      const root = new URL(`../data/solid-libraries/${slug}/`, import.meta.url);
      const packed = await json(new URL(`../data/component-previews/solid/${slug}-packed.json`, import.meta.url));
      assert.equal(packed.encoding, "br");
      const assets = await json(new URL("assets.json", root));
      const artifact = decodeSolidPreviewArtifact(packed, assets.assets);
      for (const reference of packed.assetReferences ?? []) {
        const asset = assets.assets[reference.url];
        assert.equal(asset.mediaType, "image/webp");
        assert.match(asset.dataUrl, /^data:image\/webp;base64,/);
        assert.match(asset.original.sha256, /^[a-f0-9]{64}$/);
        assert.ok(asset.original.bytes > 0 && asset.transformation, `${slug}: conversion provenance missing`);
        assert.throws(() => decodeSolidPreviewArtifact(packed, {}), /asset/i, `${slug}: missing asset must fail`);
        assert.throws(() => decodeSolidPreviewArtifact(packed, { ...assets.assets, [reference.url]: { ...asset, sha256: "0".repeat(64) } }), /asset/i, `${slug}: changed asset hash must fail`);
      }
      const evidence = await json(new URL("build-evidence.json", root));
      const lock = await readFile(new URL("package-lock.json", root));
      const hash = value => `sha256:${createHash("sha256").update(value).digest("hex")}`;
      assert.deepEqual(Object.keys(artifact.entries).sort(), Object.keys(evidence.entries).sort());
      for (const [id, entry] of Object.entries(artifact.entries)) {
        const group = artifact.groups[entry.group];
        const record = evidence.groups[evidence.entries[id].group];
        assert.ok(group && record, `${id}: missing group`);
        assert.equal(hash(group.code), record.codeIntegrity, `${id}: bundled code changed`);
        assert.equal(hash(artifact.styles[group.style]), record.cssIntegrity, `${id}: compiled CSS changed`);
        assert.equal(hash(lock), record.lockIntegrity, `${id}: lockfile changed`);
        assert.deepEqual(entry.source, evidence.entries[id].source, `${id}: source identity changed`);
      }
    });
  }
});
