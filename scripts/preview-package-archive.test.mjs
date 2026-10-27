import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { authenticateArchive, authenticateRuntimeFile, readVerifiedMetadata, restoreArchive, resolveNpmCli } from "./preview-package-archive.mjs";

const tar = createRequire(resolveNpmCli())("tar");
const cache = resolve("node_modules/.cache/col-preview-archive-tests");
mkdirSync(cache, { recursive: true });
const archive = entries => gzipSync(Buffer.concat([...entries.flatMap(({ path, content = "", type = "File", linkpath }) => {
  const bytes = Buffer.from(content);
  const header = new tar.Header({ path, size: bytes.length, mode: 0o644, type, linkpath });
  header.encode();
  return [header.block, bytes, Buffer.alloc((512 - bytes.length % 512) % 512)];
}), Buffer.alloc(1024)]));
const integrity = bytes => "sha512-" + createHash("sha512").update(bytes).digest("base64");
const restore = (bytes, options = {}) => restoreArchive({ bytes, integrity: integrity(bytes), installRoot: mkdtempSync(resolve(cache, "case-")), packagePath: "node_modules/actual", Parser: tar.Parser, allowFile: () => true, verifiedFiles: new Set(), ...options });

test("authenticated archive restoration replaces altered bytes and excludes stale files", () => {
  const installRoot = mkdtempSync(resolve(cache, "case-"));
  const packageRoot = resolve(installRoot, "node_modules/actual");
  mkdirSync(packageRoot, { recursive: true });
  writeFileSync(resolve(packageRoot, "index.js"), "altered");
  writeFileSync(resolve(packageRoot, "stale.js"), "stale");
  const verifiedFiles = new Set();
  const bytes = archive([{ path: "package/index.js", content: "export const actual = true;" }, { path: "package/index.d.ts", content: "declaration" }]);
  restore(bytes, { installRoot, verifiedFiles, allowFile: local => local.endsWith(".js") });
  assert.equal(readFileSync(resolve(packageRoot, "index.js"), "utf8"), "export const actual = true;");
  assert.deepEqual([...verifiedFiles], ["node_modules/actual/index.js"]);
  restore(bytes, { installRoot, verifiedFiles });
  assert.ok(verifiedFiles.has("node_modules/actual/index.d.ts"));
  assert.ok(!verifiedFiles.has("node_modules/actual/stale.js"));
});

test("archive integrity is checked before files can be restored", () => {
  const bytes = archive([{ path: "package/index.js", content: "actual" }]);
  const altered = Buffer.from(bytes);
  altered[12] ^= 1;
  assert.throws(() => authenticateArchive(altered, integrity(bytes)), /integrity mismatch/);
  assert.throws(() => restore(altered, { integrity: integrity(bytes) }), /integrity mismatch/);
});

test("verification-only retries accept only runtime bytes matching the authenticated archive", () => {
  const bytes = archive([{ path: "package/index.js", content: "actual source" }]);
  const expectedHashes = new Map();
  restore(bytes, { expectedHashes, restoreFile: () => false });
  assert.doesNotThrow(() => authenticateRuntimeFile(Buffer.from("actual source"), "node_modules/actual/index.js", expectedHashes));
  assert.throws(() => authenticateRuntimeFile(Buffer.from("altered source"), "node_modules/actual/index.js", expectedHashes), /unverified cached file/);
  assert.throws(() => authenticateRuntimeFile(Buffer.from("actual source"), "node_modules/actual/stale.js", expectedHashes), /unverified cached file/);
});

test("stale license and nested package metadata cannot provide provenance", () => {
  const installRoot = mkdtempSync(resolve(cache, "case-"));
  const packageRoot = resolve(installRoot, "node_modules/actual");
  const expectedHashes = new Map();
  restore(archive([{ path: "package/package.json", content: '{"name":"actual","version":"1.0.0"}' }]), { installRoot, expectedHashes });
  mkdirSync(resolve(packageRoot, "nested"));
  for (const name of ["LICENSE", "README.md", "nested/package.json"]) {
    const filename = resolve(packageRoot, name);
    writeFileSync(filename, "stale metadata");
    assert.equal(readVerifiedMetadata(filename, "node_modules/actual/" + name, expectedHashes), undefined);
  }
  assert.equal(JSON.parse(readVerifiedMetadata(resolve(packageRoot, "package.json"), "node_modules/actual/package.json", expectedHashes)).name, "actual");
  writeFileSync(resolve(packageRoot, "package.json"), "altered metadata");
  assert.throws(() => readVerifiedMetadata(resolve(packageRoot, "package.json"), "node_modules/actual/package.json", expectedHashes), /unverified cached file/);
});

test("archive traversal and links cannot escape the exact package directory", () => {
  for (const path of ["package/../../outside.js", "package/..\\..\\outside.js", "package/C:/outside.js"]) {
    assert.throws(() => restore(archive([{ path, content: "escape" }])), /Unsafe archive entry|escaped package root/);
  }
  for (const type of ["SymbolicLink", "Link"]) assert.throws(() => restore(archive([{ path: "package/link", type, linkpath: "../../outside" }])), /Unsafe archive entry/);
  assert.throws(() => restore(archive([{ path: "package/index.js" }]), { packagePath: "../../outside" }), /escaped install root/);
});

test("a pre-existing directory link cannot redirect authenticated file writes", () => {
  const installRoot = mkdtempSync(resolve(cache, "case-"));
  const packageRoot = resolve(installRoot, "node_modules/actual");
  const outside = mkdtempSync(resolve(cache, "outside-"));
  mkdirSync(packageRoot, { recursive: true });
  symlinkSync(outside, resolve(packageRoot, "linked"), "junction");
  assert.throws(() => restore(archive([{ path: "package/linked/new/index.js", content: "escape" }]), { installRoot }), /symlink/);
  assert.ok(!existsSync(resolve(outside, "new")));
});
