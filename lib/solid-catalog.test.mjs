import assert from "node:assert/strict";
import test from "node:test";
import { CATEGORIES, STACKS, USE_CASES } from "../data/libraries.ts";
import { solidCatalogs } from "../data/solid-libraries/catalog.ts";

test("Solid catalog entries use recognized categories, stacks, and use cases", () => {
  for (const [slug, { library }] of Object.entries(solidCatalogs)) {
    assert.equal(library.slug, slug);
    assert.ok(CATEGORIES.includes(library.category), `${slug}: ${library.category}`);
    for (const stack of library.stacks) assert.ok(STACKS.includes(stack), `${slug}: ${stack}`);
    for (const useCase of library.useCases) assert.ok(USE_CASES.includes(useCase), `${slug}: ${useCase}`);
  }
});
