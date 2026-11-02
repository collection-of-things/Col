import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createCatalogueTools } from "../../lib/mcp-tools.ts";
import { libraries } from "../../data/libraries.ts";
import { componentIndex } from "../../data/components.ts";
import { libraryDetails } from "../../data/library-details/index.ts";
import { libraryCorpus } from "../../data/library-corpus/index.ts";
import { compatibility } from "../../data/compatibility.ts";

const tools = createCatalogueTools({ libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility });
test("all motion component lookups retain their individually verified dependencies", async () => {
  for (const slug of ["nikala-ui", "magicui-solid", "mystic-ui"]) {
    const evidence = JSON.parse(await readFile(`data/solid-libraries/${slug}/dependencies.json`, "utf8"));
    for (const [id, entry] of Object.entries(evidence.entries)) {
      const response = tools.invoke("get_component", { id });
      assert.ok(!response.isError, id);
      assert.deepEqual(response.structuredContent.dependencies, entry.dependencies, id);
      assert.deepEqual(response.structuredContent.registryDependencies, entry.registryDependencies, id);
      assert.deepEqual(entry.unresolved, [], `Unresolved local dependency: ${id}`);
      assert.ok(entry.sources.every(source => source.url && source.integrity), id);
    }
  }
});
test("reported primitive and motion dependencies reach public MCP lookup", () => {
  const accordion = tools.invoke("get_component", { id: "nikala-ui/Accordion" }).structuredContent;
  assert.ok(accordion.dependencies.includes("@kobalte/core"));
  const beam = tools.invoke("get_component", { id: "magicui-solid/Animated Beam" }).structuredContent;
  assert.ok(beam.dependencies.includes("motion"));
  assert.ok(beam.registryDependencies.includes("@magicui-solid/theme"));
  for(const name of ["Toggle Group","Timeline"])assert.ok(tools.invoke("get_component",{id:`nikala-ui/${name}`}).structuredContent.dependencies.includes("lucide-solid"),`Original demo icon requirement: ${name}`);
});
