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
import { solidPreviews } from "../data/component-previews/solid/index.ts";

const tools = createCatalogueTools({ libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility });
const invoke = (name, args) => {
  const result = tools.invoke(name, args);
  assert.equal(result.isError, undefined, result.content[0].text);
  return result.structuredContent;
};

test("a Solid developer discovers Kobalte and renders its original documented example", () => {
  const search = invoke("search_libraries", { query: "Kobalte", stacks: ["SolidJS"] });
  assert.equal(search.results[0]?.slug, "kobalte");
  const library = invoke("get_library", { slug: "kobalte" });
  assert.ok(library.components.some(component => component.id === "kobalte/Button"));
  const component = invoke("get_component", { id: "kobalte/Button" });
  assert.ok(component.documentation.snapshots.some(snapshot => snapshot.componentId === "kobalte/Button"));
  assert.equal(component.preview.available, true);
  const rendered = invoke("render_component", { id: "kobalte/Button", format: "html", theme: "dark" });
  assert.equal(rendered.preview.runtime, "solid");
  assert.match(rendered.html, /sandbox="allow-scripts allow-forms"/);
  assert.match(JSON.stringify(rendered.preview), /0\.13\.14/);
});

const librariesUnderTest = [
  { slug: "kobalte", name: "Kobalte", runtime: "1.9.17", components: ["Button", "Dialog", "Tabs"], style: /#0284c5|hsl\(200 98% 39%\)/, source: /githubusercontent\.com\/kobaltedev\/kobalte\// },
  { slug: "solid-ui", name: "SolidUI", runtime: "1.9.3", components: ["Button", "Accordion", "Progress Circle"], style: /--primary/, source: /githubusercontent\.com\/stefan-karger\/solid-ui\// },
  { slug: "shadcn-solid", name: "shadcn-solid", runtime: "1.9.17", components: ["Button", "Dialog", "Tabs"], style: /data-kb-theme=dark/, source: /githubusercontent\.com\/hngngn\/shadcn-solid\// },
  { slug: "zaidan", name: "Zaidan", runtime: "1.9.17", components: ["Button", "Checkbox", "Dialog"], style: /style-vega/, source: /githubusercontent\.com\/carere\/zaidan\// },
  { slug: "hope-ui", name: "hope-ui", runtime: "2.0.0-beta.32", components: ["Button", "Dialog", "Select"], style: /--hope-primary/, source: /githubusercontent\.com\/hope-ui\/hope-ui\// },
  { slug: "rocksolid", name: "RockSolid", runtime: "1.9.15", components: ["Button", "Dialog", "Tabs"], style: /@keyframes fade/, source: /githubusercontent\.com\/darshan-rajadhyaksha\/rocksolid\// },
  { slug: "nikala-ui", name: "Nikala UI", runtime: "1.9.17", components: ["Button", "Toggle Group", "Timeline"], style: /--primary/, source: /githubusercontent\.com\/nikala-ui\/ui\// },
  { slug: "torch-ui", name: "TorchUI", runtime: "1.9.11", components: ["Button", "Dialog", "Accordion"], style: /--primary/, source: /githubusercontent\.com\/sean-dowd-sr\/torch-ui\// },
  { slug: "magicui-solid", name: "MagicUI Solid", runtime: "1.9.17", components: ["Marquee", "Ripple Button", "Shimmer Button"], style: /@keyframes marquee/, source: /githubusercontent\.com\/axuj\/magicui-solid\// },
  { slug: "mystic-ui", name: "Mystic UI", runtime: "1.9.17", components: ["Marquee", "Orbiting Circles", "Ripple"], style: /@keyframes marquee/, source: /githubusercontent\.com\/TheComputerM\/mystic-ui\// },
];

test("each requested library is discoverable with verified component guidance and authentic styled previews", async t => {
  for (const expected of librariesUnderTest) {
    await t.test(expected.name, () => {
      const hit = invoke("search_libraries", { query: expected.name, stacks: ["SolidJS"] }).results.find(result => result.slug === expected.slug);
      assert.ok(hit, `${expected.name} must appear in SolidJS search`);
      const library = invoke("get_library", { slug: expected.slug });
      assert.ok(library.compatibility.supported.some(fact => fact.subject === "solid-js"));
      assert.ok(library.documentation.snapshots.length > 0, `${expected.name} needs source-backed setup guidance`);
      for (const snapshot of library.documentation.snapshots) {
        assert.doesNotMatch(snapshot.content, /(?:^|\n)\s*(?:npx|npm|pnpm|bun|yarn)\s+(?:install|add|init|dlx|[^\n]*\s(?:add|init))\b/, `${expected.name} must link to setup without publishing install commands`);
      }
      assert.ok(expected.components.every(name => library.components.some(component => component.id === `${expected.slug}/${name}`)));

      for (const name of expected.components) {
        const id = `${expected.slug}/${name}`;
        const matches = invoke("search_components", { query: name, library: expected.slug, stacks: ["SolidJS"] });
        assert.ok(matches.results.some(result => result.id === id), `${id} must appear in component search`);
        const component = invoke("get_component", { id });
        assert.ok(component.documentation.snapshots.some(snapshot => snapshot.componentId === id && snapshot.content.length > 0), `${id} needs implementation evidence`);
        assert.equal(component.preview.available, true, `${id} needs an actual preview`);
        assert.equal(component.preview.runtimeVersion, expected.runtime, `${id} needs the library's own Solid version`);
        assert.match(component.preview.source.url, expected.source);
        for (const theme of ["light", "dark"]) {
          const widget = invoke("render_component", { id, theme });
          const fallback = invoke("render_component", { id, theme, format: "html" });
          assert.equal(widget.preview.runtime, "solid");
          assert.equal(widget.preview.code, fallback.preview.code, `${id} must use the same implementation in both formats`);
          assert.match(widget.preview.code, expected.style, `${id} must retain the upstream theme or animation`);
          assert.match(fallback.html, /sandbox="allow-scripts allow-forms"/);
          assert.match(fallback.html, /Library implementation:/);
        }
      }
    });
  }
});

test("MCP Apps receive each library's bundle separately from model-facing text", { timeout: 30_000 }, async t => {
  const server = createColMcpServer({ libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility });
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
  await request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "solid-libraries-test", version: "1" } });
  await client.send({ jsonrpc: "2.0", method: "notifications/initialized" });
  for (const expected of librariesUnderTest) {
    const result = await request("tools/call", { name: "render_component", arguments: { id: `${expected.slug}/${expected.components[0]}` } });
    assert.equal(result.isError, undefined);
    assert.equal(result.structuredContent.preview.runtimeVersion, expected.runtime);
    assert.equal(result.structuredContent.preview.code, undefined);
    assert.equal(JSON.parse(result.content[0].text).preview.code, undefined);
    assert.equal(result._meta["col/preview"].requestKey, result.structuredContent.preview.requestKey);
    assert.ok(result._meta["col/preview"].code.length > 0);
    assert.ok(result.content[0].text.length < 10_000);
  }
});

test("example guidance includes its imported dependencies and supporting data", () => {
  for (const id of ["nikala-ui/Toggle Group", "nikala-ui/Timeline"]) {
    assert.ok(invoke("get_component", { id }).dependencies.includes("lucide-solid"), id);
  }
  const select = invoke("get_component", { id: "hope-ui/Select" });
  assert.ok(select.documentation.snapshots.some(snapshot => snapshot.content.includes("FRUIT_NAMES") && snapshot.sources.some(source => source.url.endsWith("/select/data.tsx"))));
});

test("embedded original Solid demo images expose their source and attribution", () => {
  for (const [id, count] of [["magicui-solid/Marquee", 6], ["mystic-ui/Marquee", 3], ["mystic-ui/Ripple", 1]]) {
    const component = invoke("get_component", { id });
    const images = component.preview.assets.filter(asset => asset.mediaType.startsWith("image/"));
    assert.equal(images.length, count, id);
    const rendered = invoke("render_component", { id, format: "html" });
    for (const asset of images) {
      assert.match(asset.sha256, /^[a-f0-9]{64}$/);
      assert.ok(asset.url.startsWith("https://") && asset.attribution.name && asset.attribution.license, id);
      assert.ok(rendered.html.includes(asset.sha256) && rendered.html.includes(asset.url), `${id} must disclose the original asset`);
    }
  }
  assert.ok(invoke("get_component", { id: "kobalte/Button" }).preview.gaps.some(gap => /font sources and licenses/.test(gap)));
});

test("a preview with missing verified CSS fails visibly instead of showing an unstyled substitute", () => {
  const entry = solidPreviews["kobalte/Button"];
  const css = entry.css;
  try {
    entry.css = "";
    const component = invoke("get_component", { id: "kobalte/Button" });
    assert.equal(component.preview.available, false);
    const rendered = invoke("render_component", { id: "kobalte/Button", format: "html" });
    assert.equal(rendered.status, "unavailable");
    assert.match(rendered.html, /required stylesheet is missing/);
  } finally { entry.css = css; }
});
