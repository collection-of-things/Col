import assert from "node:assert/strict";
import test from "node:test";
import { init, parse } from "es-module-lexer/js";
import { transform } from "sucrase";
import { createComponentPreview } from "./component-preview.ts";
import { adaptPreviewSourceImports } from "./component-preview-source-adapters.ts";
import sources from "../data/component-previews/extra.json" with { type: "json" };
import { transformPreviewPackageImports } from "./component-preview-package-bundles.ts";

test("the YouTube-only adapter is scoped to the exact reviewed demo and rejects source drift", () => {
  const source = sources.entries["cult-ui/Side Panel"].code;
  const adapted = adaptPreviewSourceImports("cult-ui/Side Panel", source);
  assert.equal(adapted.replace('from"react-player@2.16.0/youtube"', 'from"react-player@2.16.0/lazy"'), source);
  assert.equal(adaptPreviewSourceImports("cult-ui/Other", source), source);
  const unrelated = 'import ReactPlayer from "react-player@2.16.0/lazy"; export default ReactPlayer;';
  assert.equal(transformPreviewPackageImports(unrelated), unrelated, "Do not alias the generic player for other components");
  for (const changed of [source + "\n", source.replace("ta6m_l3lZvQ", "another-video"), source.replace("react-player@2.16.0/lazy", "react-player@2.17.0/lazy")]) {
    assert.throws(() => adaptPreviewSourceImports("cult-ui/Side Panel", changed), /reviewed, unchanged source and fixed video URL/);
  }
});

test("the actual Side Panel uses only literal imports while preserving CSP playback limits", async () => {
  const preview = createComponentPreview({ id: "cult-ui/Side Panel" }, "https://cult-ui.com/docs/components/side-panel");
  assert.ok(preview.available);
  const js = transform(preview.code, { transforms: ["typescript", "jsx"], jsxRuntime: "automatic", production: true, disableESTransforms: true, keepUnusedImports: true }).code;
  await init();
  const imports = parse(js)[0].filter(entry => entry.type !== "import-meta");
  const invalid = imports.filter(entry => !entry.specifier || entry.glob || entry.phase);
  assert.deepEqual(invalid, []);
  assert.ok(imports.every(entry => !entry.specifier.startsWith("react-player")), "ReactPlayer must use its authenticated bundle, not CDN compilation");
  assert.equal(preview.source.integrity, sources.entries["cult-ui/Side Panel"].source.integrity);
  assert.ok(preview.gaps.some(gap => /official YouTube-only/.test(gap)));
  assert.ok(preview.gaps.some(gap => /CSP/.test(gap) && /cannot play/.test(gap)));
});
