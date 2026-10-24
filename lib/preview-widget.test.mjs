import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { parse as parseTsx } from "@babel/parser";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import { createColMcpServer } from "./mcp-server.ts";
import { createCatalogueTools } from "./mcp-tools.ts";
import { mountable, PREVIEW_WIDGET_MIME, PREVIEW_WIDGET_URI, previewFragmentHtml, previewWidgetHtml, resolveImport, validatePreviewSyntax, verifiedPreviewFragmentHtml } from "./preview-widget.ts";
import { libraries } from "../data/libraries.ts";
import { componentIndex } from "../data/components.ts";
import { libraryDetails } from "../data/library-details/index.ts";
import { libraryCorpus } from "../data/library-corpus/index.ts";
import { compatibility } from "../data/compatibility.ts";

const data = { libraries, componentIndex, details: libraryDetails, corpus: libraryCorpus, compatibility };

test("render_component rejects replacement code even when a real component id is supplied", () => {
  const tools = createCatalogueTools(data);
  const code = 'export default () => <button>Imitation</button>';
  assert.equal(tools.invoke("render_component", { code }).isError, true);
  assert.equal(tools.invoke("render_component", { id: "mantine/Button", code }).isError, true);
});

test("the Apps bridge disables schema JIT before evaluating the SDK module", async () => {
  const script = previewWidgetHtml().match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  const compiled = ts.transpileModule(script, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  let jitless = false;
  let connected = false;
  await runInNewContext(`(async () => { ${compiled} })()`, {
    exports: {},
    require(specifier) {
      if (specifier.startsWith("https://esm.sh/zod@")) {
        return { config(options) { jitless = options.jitless; } };
      }
      assert.equal(jitless, true, "SDK schemas are evaluated during import, before App construction");
      return {
        App: class {
          async connect() { connected = true; }
          getHostContext() { return undefined; }
        },
      };
    },
    addEventListener() {},
  });
  assert.equal(connected, true, "the bridge must still initialize");
});

test("the widget renders only matching server results and ignores stale errors", async () => {
  const tools = createCatalogueTools(data);
  const script = previewWidgetHtml().match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  const compiled = ts.transpileModule(script, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  let app;
  const status = { hidden: false, textContent: "" };
  const root = { innerHTML: "", frames: [], replaceChildren() { this.innerHTML = ""; this.frames = []; }, append(frame) { this.frames.push(frame); } };
  await runInNewContext(`(async () => { ${compiled} })()`, {
    exports: {}, addEventListener() {},
    require(specifier) {
      if (specifier.startsWith("https://esm.sh/zod@")) return { config() {} };
      return { App: class { constructor() { app = this; } async connect() {} getHostContext() {} } };
    },
    document: {
      getElementById(id) { return id === "col-status" ? status : root; },
      createElement() { return { style: {}, setAttribute() {}, remove() { root.frames = root.frames.filter((item) => item !== this); } }; },
    },
  });
  const oldInput = { id: "mantine/Unknown" };
  const currentInput = { id: "mantine/Button" };
  app.ontoolinput({ arguments: oldInput });
  app.ontoolinput({ arguments: currentInput });
  assert.equal(root.frames.length, 0, "input alone must never execute a component");
  app.ontoolresult(tools.invoke("render_component", currentInput));
  assert.equal(root.frames.length, 1);
  const currentFrame = root.frames[0];
  app.ontoolresult(tools.invoke("render_component", oldInput));
  app.ontoolresult({ isError: true });
  assert.equal(status.hidden, true, "old or unidentified errors must not overwrite a successful result");
  assert.equal(root.frames[0], currentFrame);
  for (const rejected of [
    { ...currentInput, code: "imitation" },
    { ...currentInput, props: {} },
    { ...currentInput, format: "invalid" },
  ]) {
    app.ontoolinput({ arguments: rejected });
    app.ontoolinput({ arguments: currentInput });
    app.ontoolresult(tools.invoke("render_component", currentInput));
    app.ontoolresult(tools.invoke("render_component", rejected));
    assert.equal(status.hidden, true, "a rejected same-ID request must not overwrite its correction");
    assert.equal(root.frames.length, 1);
  }
  app.ontoolinput({ arguments: { theme: "dark", ...currentInput } });
  app.ontoolresult(tools.invoke("render_component", { ...currentInput, theme: "dark" }));
  assert.equal(root.frames.length, 1, "field order must not affect request identity");
  const unsupported = { id: "shadcn-ui/Button" };
  app.ontoolinput({ arguments: unsupported });
  app.ontoolresult(tools.invoke("render_component", currentInput));
  assert.equal(root.frames.length, 0, "a late successful result must not restore the old frame");
  app.ontoolresult(tools.invoke("render_component", unsupported));
  assert.match(root.innerHTML, /Preview unavailable: shadcn-ui\/Button/);
  app.ontoolinput({ arguments: oldInput });
  app.ontoolresult(tools.invoke("render_component", oldInput));
  assert.match(status.textContent, /unknown component id/);
});

test("malformed JSX is rejected before compilation with a source-free location", () => {
  const code = 'export default () => <main>private-marker</div>';
  assert.throws(() => validatePreviewSyntax(code, parseTsx), (error) => {
    assert.match(error.message, /Invalid TSX at line 1, column \d+/);
    assert.doesNotMatch(error.message, /private-marker/);
    return true;
  });
});

test("TSX validation rejects nested, fragment, member-name and incomplete syntax errors", () => {
  for (const code of [
    'export default () => <main><span>Broken</main></span>',
    'export default () => <><span>Broken</span></main>',
    'export default () => <Menu.Item>Broken</Menu.Other>',
    'export default () => <main><span /></div>',
    'export default () => <main>',
    'export default () => <main title="unfinished>Broken</main>',
    'export default () => <main>{const x = 1}</main>',
  ]) assert.throws(() => validatePreviewSyntax(code, parseTsx), /Invalid TSX/, code);
  assert.throws(() => validatePreviewSyntax('export default () => (\n<main>Broken</div>\n)', parseTsx), /line 2, column 13/);
});

test("TSX validation preserves valid fragments, TypeScript and export forms without type checking", () => {
  for (const code of [
    'export default () => <><main><span /></main></>',
    'const Menu = {Item: () => null}; export default () => <Menu.Item />',
    'import {ReactNode} from "react"; const x: ReactNode = <span />; export default () => x',
    'import type {ReactNode} from "react"; const Demo = () => null; export {Demo as default}',
    'const identity = <T,>(value: T): T => value; export default () => <p>{identity("ok")}</p>',
    'import {Component} from "react"; export default class Demo extends Component {render() {return <p />}}',
    'export default\n() => <p title="</div>">{`</span>`}{/* </main> */ "</aside>"}</p>',
    'const count: number = "syntax-valid"; export default () => <p>{count}</p>',
  ]) assert.doesNotThrow(() => validatePreviewSyntax(code, parseTsx), code);
});

// esm.sh resolves `?deps=` pins to the same module URLs as the pinned React
// imports, which is what keeps one React without an import map.
test("imports resolve to one pinned React and esm.sh packages", () => {
  const v = "19.3.0";
  assert.equal(resolveImport("react", v), "https://esm.sh/react@19.3.0");
  assert.equal(resolveImport("react/jsx-runtime", v), "https://esm.sh/react@19.3.0/jsx-runtime");
  assert.equal(resolveImport("react-dom/client", v), "https://esm.sh/react-dom@19.3.0/client?deps=react@19.3.0");
  assert.equal(resolveImport("@mantine/core@9.7.1", v), "https://esm.sh/@mantine/core@9.7.1?deps=react@19.3.0,react-dom@19.3.0");
  assert.equal(resolveImport("reactflow", v), "https://esm.sh/reactflow?deps=react@19.3.0,react-dom@19.3.0", "only react and react-dom are React");
  assert.equal(resolveImport("@mantine/core/styles.css", v), "https://esm.sh/@mantine/core/styles.css");
  assert.equal(resolveImport("https://esm.sh/cmdk@1.1.1", v), "https://esm.sh/cmdk@1.1.1");
  for (const local of ["./button", "/x", "@/components/ui/button", "~/lib/utils"]) {
    assert.throws(() => resolveImport(local, v), /inline/, `${local} must ask for inlining`);
  }
});

test("anonymous default exports become mountable and missing defaults fail clearly", () => {
  const out = mountable("export default () => null;", { type: "direct", name: "default", exportStart: 0, end: 14 });
  assert.ok(out.includes("const __ColComponent =  () => null;"));
  assert.ok(out.trimEnd().endsWith("window.__colMount(__ColComponent, 0);"));
  assert.throws(() => mountable("export const Demo = () => null;"), /export default/);
});

test("fallback frames have an opaque sandbox and per-frame bounded resizing", () => {
  const html = previewFragmentHtml("export default () => null;");
  assert.match(html, /sandbox="allow-scripts allow-forms"/);
  assert.doesNotMatch(html, /allow-same-origin|allow-top-navigation|allow-popups/);
  assert.match(html, /document.currentScript.previousElementSibling/);
  assert.match(html, /Number.isFinite/);
});

test("export-like text does not replace the component chosen by the module parser", async () => {
  const source = '// example: export default function Example() {}\nexport default function Demo() { return "mounted"; }';
  const start = source.indexOf('export default function Demo');
  const output = mountable(source, { type: 'direct', name: 'default', localName: 'Demo', exportStart: start, end: start + 14 });
  let mounted;
  globalThis.window = { __colMount: (Component) => { mounted = Component; } };
  try {
    await import('data:text/javascript;base64,' + Buffer.from(output).toString('base64'));
    assert.equal(mounted(), 'mounted');
  } finally {
    delete globalThis.window;
  }
});

test("the view's inline script is valid JavaScript after embedding", () => {
  const html = previewWidgetHtml();
  const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  const { diagnostics } = ts.transpileModule(script, { reportDiagnostics: true, compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  assert.deepEqual(diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")), []);
  assert.ok(script.includes("app.ontoolresult"), "the view must use the server-selected implementation");
});

// Claude Code's inline widget restyles every input with high-specificity CSS,
// so the fallback isolates the render in an <iframe srcdoc> that host CSS cannot reach.
test("the HTML fragment isolates the render and embeds the code safely", () => {
  const code = 'export default () => <p title="a & b">{"</script><b>x</b>"}</p>;';
  const html = previewFragmentHtml(code);
  const attr = html.match(/<iframe data-col-preview [^>]*srcdoc="([^"]*)"/);
  assert.ok(attr, "the render must sit in an isolated srcdoc frame");
  assert.equal(/<!doctype|<html|<head|<body/i.test(html.replace(attr[0], "")), false, "widget tools take fragments, not documents");

  const page = attr[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  assert.match(page, /^<!doctype html>/, "the frame holds a complete page of its own");
  const scripts = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.equal(scripts.length, 1, "the embedded code must not close its script element early");
  const [script] = scripts;
  assert.equal(/^\s*(import|export)\s/m.test(script), false, "only dynamic imports, so it runs where module scripts may not");
  const { diagnostics } = ts.transpileModule(script, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022 } });
  assert.deepEqual(diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")), []);
  assert.equal(JSON.parse(script.match(/render\(("(?:[^"\\]|\\.)*")\)/)[1]), code, "the code must round-trip unchanged");
});

test("render_component selects a pinned library export and preserves it in the HTML fallback", () => {
  const tools = createCatalogueTools(data);
  const args = { id: "mantine/Button", theme: "dark", styles: ".mantine-Button-root { border-radius: 0; }" };
  const ok = tools.invoke("render_component", args);
  assert.equal(ok.isError, undefined);
  assert.equal(ok.structuredContent.status, "sent-to-chat");
  assert.ok(ok.structuredContent.gaps.some((gap) => /Claude Code/.test(gap) && /'html'/.test(gap)), "must point Claude Code at the HTML fallback");
  assert.equal(ok.structuredContent.preview.package, "@mantine/core");
  assert.equal(ok.structuredContent.preview.version, "9.7.1");
  const code = ok.structuredContent.preview.code;
  assert.match(code, /import \{ Button, MantineProvider \} from "@mantine\/core@9\.7\.1"/);
  assert.match(code, /@mantine\/core@9\.7\.1\/styles\.css/);
  assert.match(code, /forceColorScheme="dark"/);
  assert.doesNotThrow(() => parseTsx(code, { sourceType: "module", plugins: ["jsx"] }));
  const html = tools.invoke("render_component", { ...args, format: "html" }).structuredContent;
  assert.equal(html.status, "html");
  assert.equal(html.preview.code, code);
  assert.equal(html.html, verifiedPreviewFragmentHtml(html.preview));
  assert.match(html.html, /Library implementation: mantine\/Button/);
  assert.ok(html.html.indexOf("data-col-provenance") < html.html.indexOf("<iframe"));
  assert.doesNotMatch(html.html, /@tailwindcss/);
  assert.equal(tools.invoke("render_component", { ...args, format: "svg" }).isError, true);
});

test("unverified, unknown, and outbound-only components cannot fall back to imitations", () => {
  const tools = createCatalogueTools(data);
  for (const format of ["widget", "html"]) {
    const response = tools.invoke("render_component", { id: "shadcn-ui/Button", format });
    assert.equal(response.structuredContent.status, "unavailable");
    assert.equal(response.structuredContent.preview.available, false);
    assert.equal(response.structuredContent.preview.code, undefined);
    assert.match(response.structuredContent.gaps.join(" "), /no verified implementation adapter/);
    assert.doesNotMatch(response.structuredContent.html ?? "", /<iframe|<script/);
  }
  assert.equal(tools.invoke("render_component", { id: "mantine/Invented" }).isError, true);
  const restricted = createCatalogueTools({ ...data, libraries: libraries.map((entry) => entry.slug === "mantine" ? { ...entry, outboundOnly: true } : entry) });
  assert.equal(restricted.invoke("render_component", { id: "mantine/Button" }).structuredContent.status, "unavailable");
  assert.equal(restricted.invoke("get_component", { id: "mantine/Button" }).structuredContent.preview.available, false);
});

test("discovery exposes preview coverage and every available composition parses with its recorded package", () => {
  const tools = createCatalogueTools(data);
  let available = 0;
  for (const [slug, entries] of Object.entries(componentIndex)) {
    for (const component of entries) {
      const id = `${slug}/${component.name}`;
      const support = tools.invoke("get_component", { id }).structuredContent.preview;
      if (!support.available) continue;
      available++;
      const preview = tools.invoke("render_component", { id }).structuredContent.preview;
      const ast = parseTsx(preview.code, { sourceType: "module", plugins: ["jsx"] });
      const imports = ast.program.body.filter((node) => node.type === "ImportDeclaration");
      assert.ok(imports.some((node) => node.source.value === `${support.package}@${support.version}` && node.specifiers.some((item) => item.imported?.name === support.exportName)), id);
      assert.equal(preview.docsUrl, component.url);
      assert.ok(preview.gaps.length >= 3);
    }
  }
  assert.equal(available, 11);
});

test("presentation data cannot inject source or hide provenance outside the frame", () => {
  const tools = createCatalogueTools(data);
  const styles = 'body { color:red } /* </style></script><script>globalThis.pwned=true</script> */';
  const response = tools.invoke("render_component", { id: "mantine/Button", styles, format: "html" }).structuredContent;
  assert.doesNotThrow(() => parseTsx(response.preview.code, { sourceType: "module", plugins: ["jsx"] }));
  const attr = response.html.match(/srcdoc="([^"]*)"/)[1];
  const page = attr.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  assert.equal([...page.matchAll(/<script>/g)].length, 1);
  assert.match(response.html.split("<iframe")[0], /Reproduction limits/);
  for (const extra of [{ package: "fake" }, { source: "fake" }, { props: { as: "button" } }, { theme: "system" }, { styles: "x".repeat(10_001) }]) {
    assert.equal(tools.invoke("render_component", { id: "mantine/Button", ...extra }).isError, true);
  }
});

// Over the wire, as a host sees it: the tool links the view and the view declares its CSP.
test("hosts receive the UI linkage and the view resource", async () => {
  const server = createColMcpServer(data);
  const [client, serverSide] = InMemoryTransport.createLinkedPair();
  await server.connect(serverSide);
  await client.start();
  const inbox = [];
  client.onmessage = (message) => inbox.push(message);
  let nextId = 1;
  const request = async (method, params) => {
    const id = nextId++;
    await client.send({ jsonrpc: "2.0", id, method, params });
    for (let tries = 0; tries < 400; tries++) {
      const reply = inbox.find((message) => message.id === id);
      if (reply) {
        assert.equal(reply.error, undefined, `${method}: ${JSON.stringify(reply.error)}`);
        return reply.result;
      }
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    throw new Error(`no response for ${method}`);
  };
  await request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "col-tests", version: "1.0.0" } });
  await client.send({ jsonrpc: "2.0", method: "notifications/initialized" });

  const { tools } = await request("tools/list", {});
  assert.equal(tools.find((tool) => tool.name === "render_component")?._meta?.ui?.resourceUri, PREVIEW_WIDGET_URI);
  assert.equal(tools.find((tool) => tool.name === "get_component")?._meta, undefined);

  const rejected = await request("tools/call", { name: "render_component", arguments: { id: "mantine/Button", code: "imitation" } });
  assert.equal(rejected.isError, true, "the SDK must reject replacement code rather than stripping it");
  const actual = await request("tools/call", { name: "render_component", arguments: { id: "mantine/Button" } });
  assert.equal(actual.structuredContent.preview.package, "@mantine/core");
  assert.equal(actual.structuredContent.preview.available, true);

  const { contents } = await request("resources/read", { uri: PREVIEW_WIDGET_URI });
  assert.equal(contents[0].mimeType, PREVIEW_WIDGET_MIME);
  assert.deepEqual(contents[0]._meta.ui.csp.resourceDomains, ["https://esm.sh", "https://cdn.jsdelivr.net"]);
  await server.close();
});
