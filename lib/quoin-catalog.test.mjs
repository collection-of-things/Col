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

const data = { libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility };
const invoke = (tools, name, args) => {
  const response = tools.invoke(name, args);
  assert.equal(response.isError, undefined, response.content[0].text);
  return JSON.parse(response.content[0].text);
};

test("a Solid developer discovers Quoin with its exact release-candidate requirements", () => {
  const tools = createCatalogueTools(data);
  const search = invoke(tools, "search_libraries", { query: "quoin", stacks: ["SolidJS"] });
  assert.equal(search.results[0]?.slug, "quoin-ui");
  const library = invoke(tools, "get_library", { slug: "quoin-ui" });
  assert.ok(library.components.some(component => component.name === "Button"));
  assert.ok(library.components.some(component => component.name === "Toast"));
  assert.match(JSON.stringify(library.compatibility), /2\.0\.0-rc\.18/);
  assert.equal(library.install, undefined);
  assert.ok(library.gettingStarted.every(link => link.includes("https://git.cafe/versecafe/quoin")));
});

test("component API evidence is scoped to the requested Quoin component and permission gated", () => {
  const tools = createCatalogueTools(data);
  const button = invoke(tools, "get_component", { id: "quoin-ui/Button" });
  assert.ok(button.documentation.snapshots.length > 0);
  assert.ok(button.documentation.snapshots.every(snapshot => snapshot.componentId === "quoin-ui/Button"));
  assert.match(JSON.stringify(button.documentation), /focusableWhenDisabled/);
  const library = invoke(tools, "get_library", { slug: "quoin-ui" });
  assert.ok(library.documentation.snapshots.every(snapshot => snapshot.componentId === undefined));

  for (const denied of ["denied", "unknown"]) {
    const restricted = createCatalogueTools({ ...data, corpus: libraryCorpus.map(entry =>
      entry.slug === "quoin-ui" ? { ...entry, permission: { ...entry.permission, status: denied } } : entry) });
    assert.deepEqual(invoke(restricted, "get_component", { id: "quoin-ui/Button" }).documentation.snapshots, []);
  }
  const outboundOnly = createCatalogueTools({ ...data, libraries: libraries.map(library =>
    library.slug === "quoin-ui" ? { ...library, outboundOnly: true } : library) });
  assert.deepEqual(invoke(outboundOnly, "get_component", { id: "quoin-ui/Button" }).documentation.snapshots, []);
});

test("Quoin lookups supply complete readable examples independently of executable bundles", () => {
  const tools = createCatalogueTools(data);
  const library = invoke(tools, "get_library", { slug: "quoin-ui" });
  assert.equal(library.componentCount, 40);
  for (const component of library.components) {
    const detail = invoke(tools, "get_component", { id: component.id });
    const example = detail.documentation.snapshots.find(snapshot => snapshot.title.endsWith(": Solid example and CSS"));
    assert.ok(example, `missing implementation example for ${component.id}`);
    assert.match(example.content, /quoin-ui\//);
    assert.match(example.content, /export default/);
    assert.ok(example.content.length < 20_000, `example for ${component.id} should remain bounded`);
    assert.ok(detail.documentation.snapshots.every(snapshot => snapshot.sourceRevision && snapshot.sources?.length));
  }
});

test("MCP clients receive the Solid runtime choice and keep compiled bundles out of model text", { timeout: 15_000 }, async t => {
  const server = createColMcpServer(data);
  t.after(() => server.close());
  const [client, serverSide] = InMemoryTransport.createLinkedPair();
  await server.connect(serverSide);
  await client.start();
  const pending = new Map();
  client.onmessage = message => pending.get(message.id)?.(message);
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
  await request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "quoin-test", version: "1" } });
  await client.send({ jsonrpc: "2.0", method: "notifications/initialized" });
  const widget = await request("tools/call", { name: "render_component", arguments: { id: "quoin-ui/Button" } });
  assert.equal(widget.isError, undefined);
  assert.equal(widget.structuredContent.preview.runtime, "solid");
  assert.equal(widget.structuredContent.preview.code, undefined);
  assert.equal(JSON.parse(widget.content[0].text).preview.code, undefined);
  assert.equal(widget._meta["col/preview"].requestKey, widget.structuredContent.preview.requestKey);
  assert.match(widget._meta["col/preview"].code, /export/);
  assert.ok(widget.content[0].text.length < 10_000);

  const fallback = await request("tools/call", { name: "render_component", arguments: { id: "quoin-ui/Button", format: "html" } });
  assert.equal(fallback.isError, undefined);
  assert.equal(fallback.structuredContent.preview.runtime, "solid");
  const frame = fallback.structuredContent.html.match(/srcdoc="([^"]*)"/)[1]
    .replaceAll("&quot;", '"').replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
  assert.match(frame, /colRuntime\([^\n]*, "solid"\)/);
  assert.match(fallback.structuredContent.html, /sandbox="allow-scripts allow-forms"/);
});
