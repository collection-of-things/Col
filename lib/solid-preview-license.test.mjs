import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { verifySolidLicenseFallback } from "../scripts/solid-preview-build.mjs";

test("an omitted npm license requires a matching immutable upstream notice", () => {
  const text = "MIT License\nCopyright example\n";
  const fallback = { url: "https://raw.githubusercontent.com/example/project/0123456789012345678901234567890123456789/LICENSE", integrity: createHash("sha256").update(text).digest("hex"), license: "MIT", text };
  assert.equal(verifySolidLicenseFallback("example", "1.0.0", "MIT", fallback).text, text);
  assert.throws(() => verifySolidLicenseFallback("example", "1.0.0", "Apache-2.0", fallback), /license/i);
  assert.throws(() => verifySolidLicenseFallback("example", "1.0.0", "MIT", { ...fallback, text: "changed" }), /integrity/i);
  assert.throws(() => verifySolidLicenseFallback("example", "1.0.0", "MIT", { ...fallback, url: "https://example.com/LICENSE" }), /source/i);
  assert.throws(() => verifySolidLicenseFallback("example", "1.0.0", "MIT", undefined), /missing/i);
});
