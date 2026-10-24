import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { collectSourcePins, createVerifiedSourceReader } from "./preview-source-integrity.mjs";

const url = "https://raw.githubusercontent.com/example/ui/immutable/component.tsx";
const digest = value => createHash("sha256").update(value).digest("hex");
const original = "export default function Button() { return 'upstream'; }";
async function fixture(t) {
  const cache = await mkdtemp(join(tmpdir(), "col-source-integrity-"));
  t.after(() => rm(cache, { recursive: true, force: true }));
  return { cache, path: join(cache, digest(url) + ".txt") };
}

test("tampered cached source is rejected without fetching or blessing a new hash", async t => {
  const { cache, path } = await fixture(t);
  await writeFile(path, "export default function Button() { return 'tampered'; }");
  const reader = createVerifiedSourceReader({ cache, pins: { [url]: digest(original) }, fetchSource() { assert.fail("A corrupt cache must fail closed"); } });
  await assert.rejects(reader.read(url), /Source integrity mismatch/);
  assert.throws(() => reader.assertValid(), /Source integrity mismatch/);
  assert.equal(reader.pins[url], digest(original));
});

test("a clean cache verifies downloaded bytes against the committed source pin", async t => {
  const { cache, path } = await fixture(t);
  const reader = createVerifiedSourceReader({ cache, pins: { [url]: digest(original) }, fetchSource: async () => new Response(original) });
  assert.equal(await reader.read(url), original);
  assert.equal(await readFile(path, "utf8"), original);
});

test("changed upstream bytes are rejected even during an explicit refresh", async t => {
  const { cache, path } = await fixture(t);
  const reader = createVerifiedSourceReader({ cache, pins: { [url]: digest(original) }, refresh: true, fetchSource: async () => new Response("changed upstream bytes") });
  await assert.rejects(reader.read(url), /Source integrity mismatch/);
  await assert.rejects(readFile(path), { code: "ENOENT" });
});

test("new source pins require refresh and cannot be seeded from an untrusted cache", async t => {
  const { cache, path } = await fixture(t);
  await writeFile(path, "poisoned cache");
  await assert.rejects(createVerifiedSourceReader({ cache, pins: {} }).read(url), /--refresh-source-pins/);
  const reader = createVerifiedSourceReader({ cache, pins: {}, refresh: true, fetchSource: async () => new Response(original) });
  assert.equal(await reader.read(url), original);
  assert.equal(reader.pins[url], digest(original));
});

test("existing source and stylesheet provenance cannot contain conflicting pins", () => {
  assert.throws(() => collectSourcePins({ entries: { button: { source: { files: [{ url, sha256: digest(original) }] } } }, styleSources: { theme: [{ url, sha256: digest("changed") }] } }), /Conflicting committed source hashes/);
});
