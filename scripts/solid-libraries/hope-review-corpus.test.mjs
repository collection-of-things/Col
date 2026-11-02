import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createCatalogueTools } from "../../lib/mcp-tools.ts";
import { libraries } from "../../data/libraries.ts";
import { componentIndex } from "../../data/components.ts";
import { libraryDetails } from "../../data/library-details/index.ts";
import { libraryCorpus } from "../../data/library-corpus/index.ts";
import { compatibility } from "../../data/compatibility.ts";
import { solidPreviews } from "../../data/component-previews/solid/index.ts";
import { hopePreviewFiles } from "./hope-review-patches.mjs";

const tools = createCatalogueTools({ libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility });

test("Hope UI component evidence corrects the upstream docs without changing its pinned examples", () => {
  const content = id => tools.invoke("get_component", { id }).structuredContent.documentation.snapshots.find(snapshot => snapshot.componentId === id).content;
  assert.match(content("hope-ui/Combobox"), /upstream documentation calls the fruit Café au lait melon.*actual name is Café au lait/i);
  assert.match(content("hope-ui/Badge"), /role="status".*aria-label.*generic span/i);
});

test("Hope Select renders the rebuilt group with its authenticated upstream provenance", async () => {
  const provenance = JSON.parse(await readFile(new URL("../../data/solid-libraries/hope-ui/provenance.json", import.meta.url), "utf8"));
  const manifest = JSON.parse(await readFile(new URL("../../data/solid-libraries/hope-ui/build-manifest.json", import.meta.url), "utf8"));
  const select = solidPreviews["hope-ui/Select"];
  const original = provenance.sources.find(source => source.path === provenance.componentSources.Select);
  assert.equal(select.group, "HopeExpanded");
  assert.equal(select.code, solidPreviews["hope-ui/Combobox"].code);
  assert.equal(select.source.url, original.url);
  assert.equal(select.source.integrity, original.integrity);
  assert.equal(select.source.revision, provenance.rev);
  for (const path of [...hopePreviewFiles, "apps/docs/src/components/demos/select/SelectBasicDemo.tsx"]) {
    const pinned = provenance.sources.find(source => source.path === `upstream/${path}`);
    const input = manifest.$groups.HopeExpanded.inputs.find(source => source.path === `upstream/${path}`);
    assert.ok(pinned, `source evidence is missing for ${path}`);
    assert.ok(input, `compiled input is missing for ${path}`);
    assert.equal(input.sha256, pinned.integrity, path);
  }
  for (const theme of ["light", "dark"]) {
    const result = tools.invoke("render_component", { id: "hope-ui/Select", format: "html", theme });
    assert.equal(result.structuredContent.preview.available, true);
    assert.ok(result.structuredContent.preview.code.includes(select.code));
    assert.match(result.structuredContent.html, /sandbox="allow-scripts allow-forms"/);
  }
});
