import assert from "node:assert/strict";
import { test } from "node:test";
import { createCatalogueTools } from "./mcp-tools.ts";
import { libraries } from "../data/libraries.ts";
import { componentIndex } from "../data/components.ts";
import { libraryDetails } from "../data/library-details/index.ts";
import { libraryCorpus } from "../data/library-corpus/index.ts";
import { compatibility } from "../data/compatibility.ts";

const tools = createCatalogueTools({ libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility });

test("oversized Solid examples link to their complete pinned source", async t => {
  for (const id of ["shadcn-solid/Data Table", "zaidan/Sidebar"]) {
    await t.test(id, () => {
      const result = tools.invoke("get_component", { id });
      assert.equal(result.isError, undefined);
      const component = result.structuredContent;
      const snapshot = component.documentation.snapshots.find(item => item.componentId === id);
      assert.ok(snapshot, `${id}: component snapshot missing`);
      const source = snapshot.sources.find(item => item.url === component.preview.source.url);
      assert.ok(source, `${id}: pinned example source missing`);
      assert.equal(source.integrity, component.preview.source.integrity);
      assert.ok(snapshot.content.includes(`[View the complete pinned example](${source.url})`));
      assert.match(snapshot.content, /example is too long to include in full/i);
      assert.doesNotMatch(snapshot.content, /Remaining official example source|```tsx/);
    });
  }
});
