import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, parse, resolve, sep } from "node:path";
import { test } from "node:test";
import { buildSolidPreview, verifySolidLicenseFallback } from "../scripts/solid-preview-build.mjs";
import { recordCssBuild } from "../scripts/solid-libraries/source-build.mjs";

test("an omitted npm license requires a matching immutable upstream notice", () => {
  const text = "MIT License\nCopyright example\n";
  const fallback = { url: "https://raw.githubusercontent.com/example/project/0123456789012345678901234567890123456789/LICENSE", integrity: createHash("sha256").update(text).digest("hex"), license: "MIT", text };
  assert.equal(verifySolidLicenseFallback("example", "1.0.0", "MIT", fallback).text, text);
  assert.throws(() => verifySolidLicenseFallback("example", "1.0.0", "Apache-2.0", fallback), /license/i);
  assert.throws(() => verifySolidLicenseFallback("example", "1.0.0", "MIT", { ...fallback, text: "changed" }), /integrity/i);
  assert.throws(() => verifySolidLicenseFallback("example", "1.0.0", "MIT", { ...fallback, url: "https://example.com/LICENSE" }), /source/i);
  assert.throws(() => verifySolidLicenseFallback("example", "1.0.0", "MIT", undefined), /missing/i);
});

test("Solid preview builds reject inputs outside the source and locked dependencies", async t => {
  const root = await mkdtemp(join(tmpdir(), "col-solid-input-"));
  t.after(async () => {
    if (!resolve(root).startsWith(resolve(tmpdir()) + sep) || !basename(root).startsWith("col-solid-input-")) throw new Error("Unexpected test directory");
    await rm(root, { recursive: true, force: true });
  });
  const sourceRoot = join(root, "source");
  await mkdir(sourceRoot);
  await writeFile(join(root, "outside.js"), "export default 42;\n");
  const entry = join(sourceRoot, "entry.js");
  await writeFile(entry, "import value from '../outside.js'; export default value;\n");
  await assert.rejects(buildSolidPreview({ entry, sourceRoot, resolveDir: process.cwd(), compiler: "solid2", runtime: "solid2" }), /outside its source and locked dependencies/);
  if (parse(root).root.toLowerCase() !== parse(process.cwd()).root.toLowerCase()) {
    const localRoot = await mkdtemp(join(process.cwd(), ".solid-preview-input-"));
    t.after(async () => {
      if (!resolve(localRoot).startsWith(resolve(process.cwd()) + sep) || !basename(localRoot).startsWith(".solid-preview-input-")) throw new Error("Unexpected test directory");
      await rm(localRoot, { recursive: true, force: true });
    });
    const localEntry = join(localRoot, "entry.js");
    await writeFile(localEntry, `import value from ${JSON.stringify(join(root, "outside.js").replaceAll("\\", "/"))}; export default value;\n`);
    await assert.rejects(buildSolidPreview({ entry: localEntry, sourceRoot: localRoot, resolveDir: process.cwd(), compiler: "solid2", runtime: "solid2" }), /outside its source and locked dependencies/);
  }
});

test("CSS build records reject compiler tools resolved outside locked dependencies", async () => {
  const require = { cache: {}, resolve: () => resolve(tmpdir(), "outside-postcss.js") };
  await assert.rejects(recordCssBuild({ resolveDir: process.cwd(), require, lock: { packages: {} } }, ""), /CSS compiler is outside locked dependencies/);
  require.resolve = () => resolve(process.cwd(), "node_modules/postcss/index.js");
  await assert.rejects(recordCssBuild({ resolveDir: process.cwd(), require, lock: { packages: {} } }, ""), /No locked CSS compiler modules were recorded/);
  const inside = require.resolve();
  require.cache[inside] = { filename: inside, children: [{ filename: resolve(tmpdir(), "outside-transitive.js"), children: [] }] };
  await assert.rejects(recordCssBuild({ resolveDir: process.cwd(), require, lock: { packages: {} } }, ""), /CSS compiler dependency is outside locked dependencies/);
});
