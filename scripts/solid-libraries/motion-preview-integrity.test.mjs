import test from "node:test";
import assert from "node:assert/strict";
import { matchesPreviewIntegrity, previewIntegrity } from "./motion-preview-integrity.mjs";

test("browser evidence only matches the exact current code and styles", () => {
  const artifact = { entries: { "example/Button": { group: "main" } }, groups: { main: { code: "export default 1", style: "base" } }, styles: { base: "button{color:red}" } };
  const original = previewIntegrity(artifact, "example/Button");
  assert.equal(matchesPreviewIntegrity(original, original), true);
  assert.equal(previewIntegrity(artifact, "example/Missing"), undefined);
  artifact.groups.main.code = "export default 2";
  assert.equal(matchesPreviewIntegrity(original, previewIntegrity(artifact, "example/Button")), false);
  artifact.groups.main.code = "export default 1";
  artifact.styles.base = "button{color:blue}";
  assert.equal(matchesPreviewIntegrity(original, previewIntegrity(artifact, "example/Button")), false);
});
