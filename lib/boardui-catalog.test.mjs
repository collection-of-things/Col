import assert from "node:assert/strict";
import { test } from "node:test";
import { libraries } from "../data/libraries.ts";
import { componentIndex } from "../data/components.ts";
import { libraryDetails } from "../data/library-details/index.ts";
import { libraryCorpus } from "../data/library-corpus/index.ts";
import { compatibility } from "../data/compatibility.ts";
import { integrations } from "../data/integrations.ts";
import audit from "../data/boardui/audit.json" with { type: "json" };
import { createComponentSearch } from "./component-directory.ts";
import { createDirectorySearch } from "./directory.ts";
import { createCatalogueTools } from "./mcp-tools.ts";
import { clientSetups } from "./integration-setup.ts";

const data = { libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility };
const tools = createCatalogueTools(data);
const invoke = (name, args) => {
  const response = tools.invoke(name, args);
  assert.equal(response.isError, undefined, response.content[0].text);
  return response.structuredContent;
};
const indexed = audit.items.filter(item => item.indexed);

test("the BoardUI audit accounts for both registries without indexing setup helpers", () => {
  assert.equal(audit.items.length, 128);
  assert.equal(new Set(audit.items.map(item => item.name)).size, audit.items.length);
  assert.equal(audit.items.filter(item => item.tier === "free").length, 88);
  assert.equal(audit.items.filter(item => item.tier === "pro").length, 40);
  assert.equal(indexed.length, 111);
  assert.equal(indexed.filter(item => item.type === "template").length, 10);
  assert.deepEqual(componentIndex.boardui.map(component => component.name), indexed.map(item => item.title));
  for (const item of audit.items) {
    assert.ok(item.reason, item.name);
    if (item.indexed) {
      assert.ok(item.docs.url.startsWith("https://www.boardui.com/components/"), item.name);
      assert.match(item.docs.integrity, /^sha256:[a-f0-9]{64}$/);
    } else {
      assert.ok(item.group === "foundations" || ["app-shell", "agent-log"].includes(item.name), item.name);
    }
  }
});

test("every documented BoardUI item resolves through component search, library search, and MCP", () => {
  const componentSearch = createComponentSearch(libraries, componentIndex);
  const directorySearch = createDirectorySearch(libraries, componentIndex);
  assert.equal(invoke("search_libraries", { query: "BoardUI", stacks: ["React", "Tailwind CSS"] }).results[0].slug, "boardui");
  const library = invoke("get_library", { slug: "boardui" });
  assert.equal(library.componentCount, indexed.length);
  assert.equal(library.pricing.model, "freemium");
  assert.equal(library.repoUrl, "https://github.com/BoardUI/boardui");
  for (const item of indexed) {
    const match = componentSearch(item.title).find(({ library }) => library.slug === "boardui");
    assert.equal(match?.component.name, item.title);
    const result = directorySearch({ query: item.title, category: null, stacks: ["React"], useCases: [], sort: "curated" })
      .find(({ library }) => library.slug === "boardui");
    assert.ok(result?.components.some(component => component.name === item.title), item.title);
    const id = `boardui/${item.title}`;
    assert.ok(invoke("search_components", { query: item.title, library: "boardui" }).results.some(component => component.id === id), id);
    const component = invoke("get_component", { id });
    assert.equal(component.url, item.docs.url);
    assert.equal(component.preview.available, false);
    if (item.tier === "pro") {
      assert.match(component.summary, /Requires a BoardUI Pro license/);
      assert.deepEqual(component.documentation.snapshots, []);
      assert.deepEqual(component.dependencies, []);
    } else {
      assert.deepEqual(component.dependencies, item.dependencies);
      assert.deepEqual(component.registryDependencies, item.registryDependencies);
      assert.equal(component.documentation.snapshots.length, 1, id);
      const snapshot = component.documentation.snapshots[0];
      assert.equal(snapshot.componentId, id);
      assert.equal(snapshot.sourceRevision, item.source.integrity);
      assert.deepEqual(snapshot.sources, [item.source]);
      assert.match(snapshot.content, /Exported names:/);
      assert.ok(snapshot.content.includes(audit.licenseNotice));
      assert.ok(snapshot.content.length < 20_000);
    }
  }
});

test("BoardUI variants sharing documentation retain separate MCP identities and source evidence", () => {
  for (const names of [
    ["Checkbox", "Checkbox Card"],
    ["Radio", "Radio Card"],
    ["Switch", "Switch Card"],
    ["Badge", "Kbd"],
    ["Chip", "Status Dot"],
    ["Date Picker", "Date Range Picker", "Meeting Scheduler"],
    ["Important Alerts Card", "Patient Info Card", "Medical Report Template"],
    ["Agent Avatar", "Multi-agent Chat", "Multi-agent Chat Template"],
    ["Project Board", "Project Board Template"],
  ]) {
    const components = names.map(name => invoke("get_component", { id: `boardui/${name}` }));
    assert.equal(new Set(components.map(component => component.url)).size, 1);
    assert.equal(new Set(components.map(component => component.id)).size, names.length);
  }
  assert.equal(invoke("search_components", { query: "kanban", library: "boardui" }).results[0].name, "Project Board");
  assert.equal(invoke("search_components", { query: "cmdk", library: "boardui" }).results[0].name, "Command Palette");
  assert.equal(invoke("search_components", { query: "App Shell", library: "boardui" }).total, 0);
  assert.equal(invoke("search_components", { query: "Agent Log", library: "boardui" }).total, 0);
});

test("BoardUI source evidence remains permission gated and separate from library-level documentation", () => {
  const library = invoke("get_library", { slug: "boardui" });
  assert.equal(library.documentation.snapshots.length, 1);
  assert.equal(library.documentation.snapshots[0].componentId, undefined);
  for (const status of ["denied", "unknown"]) {
    const restricted = createCatalogueTools({ ...data, corpus: libraryCorpus.map(entry => entry.slug === "boardui"
      ? { ...entry, permission: { ...entry.permission, status } } : entry) });
    const response = restricted.invoke("get_component", { id: "boardui/Button" });
    assert.deepEqual(response.structuredContent.documentation.snapshots, []);
  }
});

test("BoardUI's official MCP listing generates the documented local command for each supported client", () => {
  const integration = integrations.find(integration => integration.slug === "boardui-mcp");
  assert.equal(integration.library, "boardui");
  assert.equal(integration.official, true);
  assert.equal(integration.url, "https://www.boardui.com/mcp");
  assert.deepEqual(integration.setup[0].server, { transport: "stdio", command: "npx", args: ["-y", "boardui@latest", "mcp"] });
  assert.deepEqual(clientSetups(integration).map(setup => setup.client), ["Claude Code", "Cursor", "VS Code", "Codex"]);
});
