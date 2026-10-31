import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { parse } from "es-module-lexer/js";
import { decodeSolidPreviewArtifact } from "../data/component-previews/solid/index.ts";

const slugs = ["kobalte", "solid-ui", "shadcn-solid", "zaidan", "hope-ui", "rocksolid", "nikala-ui", "torch-ui", "magicui-solid", "mystic-ui"];
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const clean = value => value.replace(/^sha256:/, "");
const json = async url => JSON.parse(await readFile(url, "utf8"));
const assetDataUrl = async (asset, root) => asset.dataUrl ?? (asset.dataUrlFile ? await readFile(new URL(asset.dataUrlFile, root), "utf8") : undefined);

test("every shipped Solid preview retains authenticated source, styling, closed imports, and license notices", async t => {
  for (const slug of slugs) {
    await t.test(slug, async () => {
      const root = new URL(`../data/solid-libraries/${slug}/`, import.meta.url);
      const extraAssets = ["solid-ui", "shadcn-solid", "zaidan"].includes(slug) ? await json(new URL("assets.json", root)).catch(error => { if (error.code !== "ENOENT") throw error; }) : undefined;
      let artifact, seed;
      if (["kobalte", "solid-ui", "shadcn-solid"].includes(slug)) {
        artifact = decodeSolidPreviewArtifact(await json(new URL(`../data/component-previews/solid/${slug}-packed.json`, import.meta.url)), extraAssets?.assets);
      } else if (["zaidan", "nikala-ui", "magicui-solid", "mystic-ui"].includes(slug)) {
        artifact = (await import(`../data/component-previews/solid/${slug}/index.ts`)).default;
        if (slug !== "zaidan") seed = await json(new URL(`../data/component-previews/solid/${slug}.json`, import.meta.url));
      } else {
        seed = await json(new URL(`../data/component-previews/solid/${slug}.json`, import.meta.url));
        const expansion = slug === "torch-ui"
          ? decodeSolidPreviewArtifact(await json(new URL("../data/component-previews/solid/torch-ui-expanded-packed.json", import.meta.url)))
          : await json(new URL(`../data/component-previews/solid/${slug}-expanded.json`, import.meta.url));
        artifact = { ...expansion, entries: { ...seed.entries, ...expansion.entries }, sources: [...seed.sources, ...expansion.sources], notices: [...seed.notices, ...expansion.notices] };
      }
      const catalog = await json(new URL("catalog.json", root));
      const corpus = await json(new URL("corpus.json", root));
      const lock = await readFile(new URL("package-lock.json", root));
      const baselineLock = await readFile(new URL("baseline-package-lock.json", root)).catch(error => { if (error.code !== "ENOENT") throw error; });
      const snapshotName = ["nikala-ui", "magicui-solid", "mystic-ui"].includes(slug) ? "upstream.json" : ["hope-ui", "rocksolid", "torch-ui"].includes(slug) ? "provenance.json" : "sources.json";
      const upstream = await json(new URL(snapshotName, root));
      let proof, groupProof;
      if (slug === "kobalte") proof = Object.fromEntries(artifact.evidence.map(({ id, integrity, ...rest }) => [id, { codeIntegrity: integrity, ...rest }]));
      else if (["solid-ui", "shadcn-solid", "zaidan"].includes(slug)) {
        const evidence = await json(new URL("build-evidence.json", root));
        proof = evidence.entries;
        groupProof = evidence.groups;
      }
      else if (["hope-ui", "rocksolid", "torch-ui"].includes(slug)) {
        const manifest = await json(new URL("build-manifest.json", root));
        proof = Object.fromEntries(Object.entries(manifest).map(([name, item]) => [`${slug}/${name}`, item]));
      } else {
        const evidence = await json(new URL("build.json", root));
        proof = evidence.records;
        groupProof = evidence.groups;
      }

      assert.equal(catalog.library.slug, slug);
      assert.equal(corpus.permission.status, "granted");
      assert.deepEqual([...Object.keys(artifact.entries), ...Object.keys(artifact.unavailable ?? {})].sort(), catalog.components.map(component => `${slug}/${component.name}`).sort());
      for (const [id, item] of Object.entries(artifact.unavailable ?? {})) assert.ok(item.reason?.trim(), `${id}: unavailable preview needs a reason`);
      if (slug === "zaidan" && artifact.entries["zaidan/Calendar"]) {
        const calendar = artifact.entries["zaidan/Calendar"];
        const style = calendar.css ?? artifact.styles?.[artifact.groups?.[calendar.group]?.style];
        for (const name of ["slide-in-left", "slide-in-right", "slide-out-left", "slide-out-right", "fade-in", "fade-out"]) {
          assert.match(style, new RegExp(`@keyframes\\s+z-calendar-${name}\\b`), `zaidan/Calendar: missing ${name} animation`);
        }
      }
      const parsed = new Map();
      for (const [id, entry] of Object.entries(artifact.entries)) {
        const group = entry.group && artifact.groups?.[entry.group];
        const code = entry.code ?? group?.code;
        const css = entry.css ?? (group && artifact.styles?.[group.style]);
        const reference = proof[id];
        const recorded = reference?.codeIntegrity ? reference : groupProof?.[reference?.group ?? entry.group] ?? artifact.groupEvidence?.[entry.group];
        assert.ok(code && css && recorded, `${id}: missing bundle, CSS, or integrity evidence`);
        assert.equal(digest(code), clean(recorded.codeIntegrity), `${id}: bundled code changed`);
        assert.equal(digest(css), clean(recorded.cssIntegrity), `${id}: compiled CSS changed`);
        const recordedLock = baselineLock && seed?.entries[id] ? baselineLock : lock;
        assert.equal(digest(recordedLock), clean(recorded.lockIntegrity), `${id}: locked dependencies changed`);
        assert.ok(artifact.sources.some(source => source.url === entry.source.url && clean(source.integrity) === clean(entry.source.integrity)), `${id}: missing pinned upstream source`);
        if (!parsed.has(code)) parsed.set(code, parse(code));
        const [imports, exports] = parsed.get(code);
        assert.equal(imports.length, 0, `${id}: runtime imports must be bundled`);
        assert.ok(exports.some(item => item.name === "default"), `${id}: missing Solid mount export`);
        assert.ok(artifact.notices.some(notice => notice.text?.trim() && code.includes(notice.text.trim().replaceAll("*/", "* /"))), `${id}: no bundled license notice`);
        assert.ok(corpus.snapshots.some(snapshot => snapshot.componentId === id), `${id}: missing source-linked component evidence`);
        for (const asset of entry.assets ?? []) {
          const original = (Array.isArray(upstream.assets) ? upstream.assets.find(item => item.url === asset.url) : upstream.assets?.[asset.url]) ?? extraAssets?.assets?.[asset.url];
          assert.ok(original, `${id}: asset source was not recorded`);
          const dataUrl = await assetDataUrl(original, root);
          const bytes = dataUrl ? Buffer.from(dataUrl.split(",")[1], "base64") : await readFile(new URL(original.path, root));
          assert.equal(digest(bytes), asset.sha256, `${id}: asset hash changed`);
          assert.equal(bytes.length, asset.bytes, `${id}: asset size changed`);
          const data = dataUrl ?? `data:${asset.mediaType};base64,${bytes.toString("base64")}`;
          assert.ok(code.includes(data) || css.includes(data), `${id}: disclosed asset is not rendered`);
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
          if (asset.blocked) {
            assert.ok(typeof asset.blocked === "string" && asset.blocked.trim(), `${slug}: ${url} needs a reason`);
            assert.ok(!asset.dataUrl && !asset.dataUrlFile && !asset.resourceFile && !asset.manifestFile, `${slug}: blocked asset was retained`);
            continue;
          }
          if (asset.manifestFile) {
            const manifest = await json(new URL(`../${asset.manifestFile}`, import.meta.url));
            const delivered = manifest.assets[url];
            assert.ok(delivered, `${slug}: ${url} is missing from its asset manifest`);
            const bytes = Buffer.from(delivered.base64, "base64");
            assert.equal(digest(bytes), clean(asset.integrity), `${slug}: ${url}`);
            assert.equal(delivered.sha256, clean(asset.integrity), `${slug}: ${url} manifest hash changed`);
            assert.equal(bytes.length, asset.bytes, `${slug}: ${url} size changed`);
            assert.equal(delivered.bytes, asset.bytes, `${slug}: ${url} manifest size changed`);
            continue;
          }
          if (asset.resourceFile) {
            const bytes = await readFile(new URL(`../${asset.resourceFile}`, import.meta.url));
            assert.equal(digest(bytes), clean(asset.integrity), `${slug}: ${url}`);
            assert.equal(bytes.length, asset.bytes, `${slug}: ${url} size changed`);
            continue;
          }
          const dataUrl = await assetDataUrl(asset, root);
          assert.ok(dataUrl, `${slug}: ${url} has no retained asset bytes`);
          assert.equal(digest(Buffer.from(dataUrl.split(",")[1], "base64")), clean(asset.integrity), `${slug}: ${url}`);
        }
      }
    });
  }
});
