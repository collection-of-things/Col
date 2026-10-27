import assert from "node:assert/strict";
import { test } from "node:test";
import { createCatalogueTools } from "./mcp-tools.ts";
import { libraries } from "../data/libraries.ts";
import { componentIndex } from "../data/components.ts";
import { libraryDetails } from "../data/library-details/index.ts";
import { libraryCorpus } from "../data/library-corpus/index.ts";
import { compatibility } from "../data/compatibility.ts";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import { createColMcpServer } from "./mcp-server.ts";

// The seam under test is `invoke`: one pure request-to-result entry point over
// the real catalogue data. Schema validation also crosses the MCP SDK below.
const tools = createCatalogueTools({
  libraries,
  componentIndex,
  details: libraryDetails,
  corpus: libraryCorpus,
  compatibility,
});

const call = (name, args) => {
  const result = tools.invoke(name, args);
  const text = result.content[0].text;
  return result.isError ? { isError: true, text } : JSON.parse(text);
};

test("get_library sends agents to the official docs and never publishes install commands", () => {
  const result = call("get_library", { slug: "wensity-ui" });
  assert.equal(result.install, undefined, "col must not publish its own install commands");
  assert.equal(result.registrySetup, undefined, "col must not publish registry setup");
  assert.equal(result.gettingStarted.length, 2);
  assert.ok(result.gettingStarted.every((step) => step.includes("https://ui.wensity.com")));
  assert.equal(/(^|\s)(npx|npm|pnpm|yarn|bun|jsrepo)\s/.test(result.gettingStarted.join(" ")), false, "setup links are links, not commands");

  const outboundTools = createCatalogueTools({
    libraries: libraries.map((library) => ({ ...library, outboundOnly: true })),
    componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility,
  });
  const listing = outboundTools.invoke("get_library", { slug: "shadcn-ui" }).structuredContent;
  assert.deepEqual(listing.gettingStarted, []);
  assert.deepEqual(listing.documentation.snapshots, []);
  assert.equal(listing.docsUrl, libraryDetails["shadcn-ui"].docsUrl);
  const component = outboundTools.invoke("get_component", { id: "shadcn-ui/Command" }).structuredContent;
  assert.deepEqual(component.dependencies, []);
  assert.deepEqual(component.registryDependencies, []);
});

test("search_libraries answers with library ids, source links, and explicit gaps", () => {
  const result = call("search_libraries", { query: "command menu", stacks: ["React", "Tailwind CSS"] });

  assert.equal(result.isError, undefined);
  const hit = result.results.find(({ slug }) => slug === "shadcn-ui");
  assert.ok(hit, "expected shadcn-ui to match 'command menu' with React and Tailwind CSS");
  assert.equal(hit.url, "https://ui.shadcn.com");
  assert.equal(hit.colListingUrl, "https://usecol.com/libraries/shadcn-ui");
  assert.ok(
    hit.matchedComponents.some(({ name }) => name === "Command"),
    "expected the Command component to explain the match",
  );

  assert.equal(result.evidence.verification.page, "verified");
  assert.equal(result.evidence.verification.snapshot, "ingested");
  assert.ok(result.evidence.gaps.some((gap) => /partial/i.test(gap)));
  assert.ok(result.total >= result.results.length);
});

test("search_libraries applies hard filters as exact constraints", () => {
  const result = call("search_libraries", { query: "date picker", stacks: ["Svelte"] });

  const slugs = result.results.map(({ slug }) => slug);
  assert.ok(slugs.includes("shadcn-svelte"), "expected shadcn-svelte for a Svelte date picker");
  assert.equal(slugs.includes("shadcn-ui"), false, "a React library must not pass the Svelte filter");
  for (const hit of result.results) assert.ok(hit.stacks.includes("Svelte"));
});

test("React Bits component names resolve consistently through library and component tools", () => {
  for (const { name, url } of componentIndex["react-bits"]) {
    const libraries = call("search_libraries", { query: `react ${name}` });
    const library = libraries.results.find(({ slug }) => slug === "react-bits");
    assert.ok(library, `expected React Bits for ${name}`);
    assert.equal(library.matchedComponents[0].name, name);
    const components = call("search_components", { query: name, library: "react-bits" });
    assert.equal(components.results[0].id, `react-bits/${name}`);
    assert.equal(components.results[0].url, url);
  }
  const overlap = call("search_libraries", { query: "circular counter" });
  assert.equal(overlap.results.some(({ slug }) => slug === "react-bits"), false);
});

test("natural-language filler words do not block a keyword search", () => {
  const prose = call("search_libraries", { query: "a library for react with tailwind" });
  const keywords = call("search_libraries", { query: "react tailwind" });

  assert.deepEqual(
    prose.results.map(({ slug }) => slug),
    keywords.results.map(({ slug }) => slug),
    "filler words should not change the matched set",
  );
});

test("results are capped and paginated with the total reported", () => {
  const page = call("search_libraries", { limit: 3, offset: 3 });

  assert.equal(page.results.length, 3);
  assert.ok(page.total > page.results.length, "the catalogue holds more than six libraries");
  const firstPage = call("search_libraries", { limit: 3 });
  assert.notDeepEqual(
    page.results.map(({ slug }) => slug),
    firstPage.results.map(({ slug }) => slug),
    "offset should advance through the result set",
  );
});

test("arguments outside the schema come back as an explicit error", () => {
  const result = call("search_libraries", { category: "Not A Category" });

  assert.equal(result.isError, true);
  assert.match(result.text, /category/i);
});

test("both search tools enforce the published Unicode query limit over MCP", { timeout: 15_000 }, async (t) => {
  const server = createColMcpServer({ libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility });
  t.after(() => server.close());
  const [client, serverSide] = InMemoryTransport.createLinkedPair();
  await server.connect(serverSide);
  await client.start();
  const pending = new Map();
  client.onmessage = (message) => pending.get(message.id)?.(message);
  let nextId = 1;
  const request = async (method, params) => {
    const id = nextId++;
    const reply = await new Promise((resolve, reject) => {
      pending.set(id, resolve);
      client.send({ jsonrpc: "2.0", id, method, params }).catch(reject);
    });
    pending.delete(id);
    assert.equal(reply.error, undefined);
    return reply.result;
  };
  await request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "query-limit-test", version: "1" } });
  await client.send({ jsonrpc: "2.0", method: "notifications/initialized" });
  const advertised = (await request("tools/list", {})).tools;
  for (const name of ["search_libraries", "search_components"]) {
    const definition = advertised.find((tool) => tool.name === name);
    assert.equal(definition.inputSchema.properties.query.maxLength, 4096);
    assert.match(definition.inputSchema.properties.query.description, /4,096 Unicode code points/);
    assert.equal(/at most one framework/i.test(definition.inputSchema.properties.stacks.description), false);
    for (const query of ["x".repeat(4096), "😀".repeat(4096), `button${"😀".repeat(4090)}`]) {
      const args = { query };
      assert.equal(tools.invoke(name, args).isError, undefined);
      const result = await request("tools/call", { name, arguments: args });
      assert.equal(result.isError, undefined, `${name} must accept 4096 code points`);
      assert.deepEqual(JSON.parse(result.content[0].text), JSON.parse(JSON.stringify(result.structuredContent)));
    }
    for (const query of ["x".repeat(4097), "😀".repeat(4097), "x".repeat(50_000)]) {
      for (const result of [tools.invoke(name, { query }), await request("tools/call", { name, arguments: { query } })]) {
        assert.equal(result.isError, true);
        const text = result.content[0].text;
        assert.ok(text.length <= 256, "oversize errors must stay concise");
        assert.ok(/4,096|4096/.test(text), "error names the limit");
        assert.equal(text.includes(query.slice(0, 100)), false, "error must not echo the query");
      }
    }
  }
  assert.equal((await request("tools/call", { name: "search_libraries", arguments: {} })).isError, undefined);
  assert.equal((await request("tools/call", { name: "search_libraries", arguments: { query: " " } })).isError, undefined);
  assert.equal((await request("tools/call", { name: "search_components", arguments: { query: "" } })).isError, true);
  const multi = await request("tools/call", { name: "search_components", arguments: { query: "dialog", stacks: ["React", "Vue"] } });
  assert.equal(multi.isError, undefined);
  assert.ok(multi.structuredContent.results.length > 0);
  assert.ok(multi.structuredContent.results.every(({ library }) => library.stacks.includes("React") && library.stacks.includes("Vue")));
});

test("an unknown tool name never silently resolves", () => {
  const result = call("search_everything", {});

  assert.equal(result.isError, true);
  assert.match(result.text, /search_everything/);
});

test("component ranking uses the same normalized keywords as matching", () => {
  const library = libraries[0];
  const tools = createCatalogueTools({
    libraries: [library],
    componentIndex: {
      [library.slug]: [
        { name: "Number Field Extended", url: "https://example.test/extended" },
        { name: "Number Field", url: "https://example.test/exact" },
        { name: "Other", aliases: ["number field"], url: "https://example.test/alias" },
        { name: "Field", url: "https://example.test/partial" },
      ],
    },
    details: {},
    corpus: [],
    compatibility: [],
  });

  for (const query of ["number field", "  NUMBER   FIELD  ", "Number\tField", "Number\nField", "Number, Field!", "find a number field component"]) {
    const result = tools.invoke("search_components", { query });
    assert.equal(result.isError, undefined);
    assert.deepEqual(
      result.structuredContent.results.map(({ name }) => name),
      ["Number Field", "Other", "Number Field Extended"],
      `unexpected ranking for ${JSON.stringify(query)}`,
    );
  }
});

test("normalized component matches explain real name or alias sources without duplicates", () => {
  for (const query of ["datepicker", "date-picker", "commandpalette", "command palette", "cmd+k", "⌘k"]) {
    const hits = call("search_components", { query }).results;
    assert.ok(hits.length > 0, query);
    for (const hit of hits) {
      assert.ok(hit.matchedOn.length > 0, `${query}: ${hit.id}`);
      assert.equal(new Set(hit.matchedOn).size, hit.matchedOn.length, `${query}: ${hit.id}`);
      for (const source of hit.matchedOn) {
        const [field, ...parts] = source.split(":");
        const value = parts.join(":");
        assert.ok(field === "name" || field === "alias", source);
        if (field === "alias") assert.ok(hit.aliases.includes(value), source);
        else assert.ok(hit.name.toLowerCase().replace(/[^a-z0-9⌘]/g, "").includes(value.replaceAll(" ", "")), source);
      }
    }
  }
  const glued = call("search_components", { query: "datepicker", library: "heroui" }).results.find(({ name }) => name === "Date Picker");
  assert.deepEqual(glued.matchedOn, ["name:datepicker"]);
});

test("get_component reports documented dependencies and no install command", () => {
  const result = call("get_component", { id: "shadcn-ui/Command" });
  assert.equal(result.install, undefined, "col must not publish install commands");
  assert.equal(result.registrySetup, undefined, "col must not publish registry setup");
  assert.ok(result.dependencies.includes("cmdk"));
  assert.ok(result.registryDependencies.includes("dialog"));
});

test("every component answer points at the docs instead of a command", () => {
  for (const id of ["shadcn-ui/Command", "magic-ui/Animated Beam", "base-ui/Alert Dialog", "uiarc/Button"]) {
    const result = call("get_component", { id });
    assert.equal(result.install, undefined, `${id} must not carry an install command`);
    assert.equal(result.registrySetup, undefined, `${id} must not carry registry setup`);
    assert.match(result.library.docsUrl, /^https:\/\//, `${id} must link the library's official docs`);
  }
});

test("compatibility unknowns name only subjects that apply to the library", () => {
  const result = call("get_library", { slug: "shadcn-ui" });
  assert.ok(!result.compatibility.unknown.includes("@emotion/react"), "Emotion is not part of a Tailwind library's vocabulary");
  assert.ok(result.compatibility.unknown.includes("react"));
});

test("a recorded range replaces the unknown for its subject", () => {
  const result = call("get_library", { slug: "heroui" });
  assert.ok(result.compatibility.supported.some((fact) => fact.subject === "react" && fact.constraint === ">= 19"));
  assert.ok(!result.compatibility.unknown.includes("react"));
});

test("search_components filters by stack and shows stacks on every hit", () => {
  const unfiltered = call("search_components", { query: "command palette" });
  assert.ok(unfiltered.results.some((hit) => hit.id.startsWith("shadcn-svelte/")), "precondition: the unfiltered query crosses stacks");
  const react = call("search_components", { query: "command palette", stacks: ["React"] });
  assert.ok(react.results.length > 0);
  for (const hit of react.results) {
    assert.ok(hit.library.stacks.includes("React"));
    assert.ok(!hit.library.stacks.includes("Svelte"));
  }
});

test("components say what kind of thing they are", () => {
  const effect = call("search_components", { query: "spotlight", library: "aceternity-ui" }).results.find((hit) => hit.name === "Spotlight");
  assert.equal(effect.kind, "visual-effect");
  const palette = call("search_components", { query: "command palette", library: "shadcn-ui" }).results[0];
  assert.equal(palette.kind, "full-pattern");
  const primitive = call("search_components", { query: "dialog", library: "radix-ui" }).results.find((hit) => hit.name === "Dialog");
  assert.equal(primitive.kind, "primitive");
});

test("components are findable under the shared names people use", () => {
  const ids = call("search_components", { query: "modal" }).results.map((hit) => hit.id);
  assert.ok(ids.includes("shadcn-ui/Dialog"), "dialog components inherit the modal alias");
});

test("every primitive-library component records its kind", () => {
  for (const slug of ["radix-ui", "base-ui", "reka-ui", "melt-ui", "ark-ui", "headless-ui", "react-aria", "corvu", "spartan-ui"]) {
    for (const component of componentIndex[slug]) {
      assert.equal(component.kind, "primitive", `${slug}/${component.name} must record its kind`);
    }
  }
});

test("a stray letter never floods the results", () => {
  const noise = call("search_components", { query: "cmd k" });
  assert.ok(noise.total > 0 && noise.total < 20, `expected a handful of word matches, got ${noise.total}`);
  assert.equal(call("search_components", { query: "e" }).total, 0);
  assert.equal(call("search_libraries", { query: "e" }).total, 0);
});

test("glued and symbol spellings resolve like the spaced form", () => {
  const spaced = call("search_components", { query: "command palette" });
  assert.equal(call("search_components", { query: "commandpalette" }).total, spaced.total);
  assert.equal(call("search_components", { query: "command-palette" }).total, spaced.total);
  assert.ok(call("search_components", { query: "cmd+k" }).results.some((hit) => hit.id === "shadcn-ui/Command"));
  assert.ok(call("search_components", { query: "⌘k" }).results.some((hit) => hit.id === "shadcn-ui/Command"));
});

test("ranking puts real search UIs above visual effects that share the word", () => {
  const hits = call("search_components", { query: "spotlight" }).results;
  const pos = (id) => hits.findIndex((hit) => hit.id === id);
  assert.ok(pos("mantine/Spotlight") >= 0 && pos("aceternity-ui/Spotlight") >= 0, "precondition: both are results");
  assert.ok(pos("mantine/Spotlight") < pos("aceternity-ui/Spotlight"), "the real Spotlight search must lead");
  assert.ok(pos("shadcn-ui/Command") < pos("aceternity-ui/Spotlight"), "a functional exact alias beats a visual effect");
});

test("every hit states what matched", () => {
  const libHits = call("search_libraries", { query: "command menu", stacks: ["React", "Tailwind CSS"] }).results;
  assert.ok(libHits.length > 0);
  assert.ok(libHits.every((hit) => hit.matchedOn.length > 0));
  assert.ok(libHits.find((hit) => hit.slug === "shadcn-ui").matchedOn.some((why) => why.startsWith("component:")));
  const compHits = call("search_components", { query: "command palette", stacks: ["React"] }).results;
  assert.ok(compHits.length > 0);
  assert.ok(compHits.every((hit) => hit.matchedOn.length > 0));
  assert.ok(compHits[0].matchedOn.includes("stack:React"));
  assert.ok(compHits[0].matchedOn.some((why) => why.startsWith("alias:") || why.startsWith("name:")));
});

test("empty results explain which kind of empty they are", () => {
  const missingLibrary = call("search_components", { query: "command", library: "not-a-library" });
  assert.equal(missingLibrary.total, 0);
  assert.equal(missingLibrary.indexStatus, "library not in index");
  const unrecorded = call("search_components", { query: "zzzz", library: "heroui" });
  assert.equal(unrecorded.indexStatus, "library indexed, component not recorded");
  const noMatch = call("search_components", { query: "command zzz" });
  assert.equal(noMatch.indexStatus, "no recorded component matches");
  assert.ok(Array.isArray(noMatch.suggestions));
  assert.ok(noMatch.suggestions.some((suggestion) => suggestion.id === "shadcn-ui/Command"), "a near miss gets a suggestion");
  assert.equal(call("search_libraries", { query: "quantum blockchain" }).indexStatus, "no recorded library matches");
});

test("get_library lists the components Col records", () => {
  const result = call("get_library", { slug: "shadcn-ui" });
  assert.equal(result.componentCount, result.components.length);
  assert.ok(result.components.some((component) => component.id === "shadcn-ui/Command"));
  assert.equal(result.components.find((component) => component.id === "shadcn-ui/Command").kind, "full-pattern");
});

test("shared caveats appear once per response, not on every hit", () => {
  const result = call("search_components", { query: "dialog" });
  assert.ok(result.results.length > 1);
  assert.ok(result.evidence.gaps.length > 0, "the shared caveat lives on the envelope");
  for (const hit of result.results) {
    assert.ok(
      !(hit.evidence?.gaps ?? []).some((gap) => result.evidence.gaps.includes(gap)),
      "per-hit gaps must not repeat the shared ones",
    );
  }
});

test("verification is stated per field and never contradicts across tools", () => {
  const fromSearch = call("search_components", { query: "command palette", library: "shadcn-ui" }).results[0];
  const fromGet = call("get_component", { id: "shadcn-ui/Command" });
  assert.deepEqual(fromSearch.evidence.verification, fromGet.evidence.verification);
  assert.deepEqual(Object.keys(fromGet.evidence.verification).sort(), ["compatibility", "page", "snapshot"]);
  assert.equal(fromGet.evidence.verification.page, "verified");
  assert.equal(fromGet.evidence.verification.snapshot, "ingested");
});

test("source URLs record their variants and when Col verified them", () => {
  const result = call("get_component", { id: "shadcn-ui/Command" });
  assert.ok(result.variants.base && result.variants.radix, "both documented variants must be recorded");
  assert.match(result.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
});
