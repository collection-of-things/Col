import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { createHash } from "node:crypto";
import ts from "typescript";
import { parse as parseTsx } from "@babel/parser";
import { parse as parseModule } from "es-module-lexer/js";
import { transform } from "sucrase";
import extraSources from "../data/component-previews/extra.json" with { type: "json" };
import packageBundles from "../data/component-previews/package-bundles.json" with { type: "json" };
import supplementalBundles from "../data/component-previews/package-bundles-supplemental.json" with { type: "json" };
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

test("the emitted compiler preserves minified upstream nullish and optional operators", () => {
  const html = previewFragmentHtml("export default () => null;");
  const page = html.match(/srcdoc="([^"]*)"/)[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  const options = runInNewContext("(" + page.match(/const options = (\{[^;]+\})\s*;/)[1] + ")");
  const source = "function read(value){return(value?.count)??7}";
  const compiled = transform(source, options).code;
  const read = runInNewContext(compiled + "; read");
  assert.equal(read(undefined), 7);
  assert.equal(read({ count: 0 }), 0);
  assert.equal(read({ count: 12 }), 12);
});

test("shadcn previews carry official source identity and compiled library styles", () => {
  const tools = createCatalogueTools(data);
  const result = tools.invoke("render_component", { id: "shadcn-ui/Button", theme: "dark" }).structuredContent;
  assert.equal(result.preview.available, true);
  assert.match(result.preview.source.url, /^https:\/\/(ui\.shadcn\.com|github\.com\/shadcn-ui\/ui)\//);
  assert.match(result.preview.source.integrity, /^sha256:[a-f0-9]{64}$/);
  assert.match(result.preview.code, /data-slot/);
  assert.match(result.preview.code, /--background/);
});

test("asset previews expose original byte provenance outside the execution frame in both formats", () => {
  const tools = createCatalogueTools(data);
  for (const id of ["shadcn-ui/Sidebar", "shadcn-ui/Avatar", "shadcn-ui/Attachment", "shadcn-ui/Message", "kibo-ui/Avatar Stack", "reui/Data Grid", "elevenlabs-ui/Orb"]) {
    const preview = tools.invoke("render_component", { id, theme: "dark" }).structuredContent.preview;
    assert.ok(preview.assets.length > 0);
    assert.match(preview.code, /data:image\/(png|jpeg);base64,/);
    assert.ok(!preview.gaps.some(gap => /original example's.*(unavailable|not hosted)/.test(gap)));
    const html = verifiedPreviewFragmentHtml(preview);
    const disclosure = html.slice(0, html.indexOf("<iframe"));
    assert.match(disclosure, /<section data-col-provenance[^>]*style="overflow-wrap:anywhere"/, "long hashes and original URLs wrap outside the component frame");
    for (const asset of preview.assets) {
      assert.match(asset.sha256, /^[a-f0-9]{64}$/);
      assert.ok(disclosure.includes(asset.sha256));
      assert.ok(!("base64" in asset));
    }
    assert.ok(disclosure.includes("Original demo assets"));
    assert.ok(!disclosure.includes("data:image"), "original bytes stay inside the isolated component frame");
  }
  const userStyles = 'body { background-image: url("https://github.com/shadcn.png"); }';
  const custom = tools.invoke("render_component", { id: "shadcn-ui/Avatar", styles: userStyles }).structuredContent.preview;
  assert.ok(custom.code.includes(`colUserStyles.textContent = ${JSON.stringify(userStyles)};`), "caller CSS remains unchanged and subject to CSP");
});

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
  let delayedMediaReads;
  const status = { hidden: false, textContent: "" };
  const root = { innerHTML: "", frames: [], replaceChildren() { this.innerHTML = ""; this.frames = []; }, append(frame) { this.frames.push(frame); } };
  await runInNewContext(`(async () => { ${compiled} })()`, {
    exports: {}, addEventListener() {}, atob, crypto,
    require(specifier) {
      if (specifier.startsWith("https://esm.sh/zod@")) return { config() {} };
      return { App: class { constructor() { app = this; } async connect() {} getHostContext() {} async readServerResource({ uri }) { if (delayedMediaReads) await new Promise(resolve => delayedMediaReads.push(resolve)); return { contents: [{ uri, blob: "YWJj" }] }; } } };
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
  const unsupported = { id: "shadcn-svelte/Button" };
  app.ontoolinput({ arguments: unsupported });
  app.ontoolresult(tools.invoke("render_component", currentInput));
  assert.equal(root.frames.length, 0, "a late successful result must not restore the old frame");
  app.ontoolresult(tools.invoke("render_component", unsupported));
  assert.match(root.innerHTML, /Preview unavailable: shadcn-svelte\/Button/);
  app.ontoolinput({ arguments: oldInput });
  app.ontoolresult(tools.invoke("render_component", oldInput));
  assert.match(status.textContent, /unknown component id/);
  const delivered = tools.invoke("render_component", currentInput).structuredContent;
  const { code, ...identity } = delivered.preview;
  const compact = { structuredContent: { ...delivered, preview: identity } };
  app.ontoolinput({ arguments: currentInput });
  app.ontoolresult(compact);
  assert.equal(root.frames.length, 0);
  assert.match(status.textContent, /did not deliver the verified source/);
  app.ontoolresult({ ...compact, _meta: { "col/preview": { requestKey: "stale", code } } });
  assert.equal(root.frames.length, 0, "metadata must belong to the same request");
  app.ontoolresult({ ...compact, _meta: { "col/preview": { requestKey: identity.requestKey, code } } });
  assert.equal(root.frames.length, 1);
  assert.ok(root.frames[0].srcdoc.includes("@mantine/core@9.7.1"));
  const sha = createHash("sha256").update("abc").digest("hex");
  const media = { [sha]: { uri: `col://preview-media/${sha}`, bytes: 3, chunkSize: 1_500_000, mediaType: "video/mp4", chunks: [sha] } };
  const needsMedia = { structuredContent: { ...delivered, preview: { ...identity, media: undefined, mediaKeys: [sha] } } };
  app.ontoolinput({ arguments: currentInput });
  await app.ontoolresult({ ...needsMedia, _meta: { "col/preview": { requestKey: identity.requestKey, code } } });
  assert.equal(root.frames.length, 0);
  assert.match(status.textContent, /did not deliver the verified media/);
  await app.ontoolresult({ ...needsMedia, _meta: { "col/preview": { requestKey: "stale", code, media } } });
  assert.equal(root.frames.length, 0);
  await app.ontoolresult({ ...needsMedia, _meta: { "col/preview": { requestKey: identity.requestKey, code, media } } });
  assert.equal(root.frames.length, 1);
  assert.ok(root.frames[0].srcdoc.indexOf('type="application/octet-stream"') < root.frames[0].srcdoc.indexOf("</head>"));
  for (const bounce of [false, true]) {
    delayedMediaReads = [];
    app.ontoolinput({ arguments: currentInput });
    const old = app.ontoolresult({ ...needsMedia, _meta: { "col/preview": { requestKey: identity.requestKey, code, media } } });
    if (bounce) app.ontoolinput({ arguments: oldInput });
    app.ontoolinput({ arguments: currentInput });
    const latest = app.ontoolresult({ ...needsMedia, _meta: { "col/preview": { requestKey: identity.requestKey, code, media } } });
    assert.equal(delayedMediaReads.length, 2);
    delayedMediaReads[1]();
    await latest;
    assert.equal(root.frames.length, 1);
    const newest = root.frames[0];
    delayedMediaReads[0]();
    await old;
    assert.equal(root.frames.length, 1, "an identical or A→B→A rerun must not append another media frame");
    assert.equal(root.frames[0], newest);
  }
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
  for (const version of ["0.2.4", "0.5.0"]) {
    assert.equal(resolveImport(`cn@${version}`, v), `https://esm.sh/cn@${version}?bundle`, "framework-independent cn uses its verified pinned CDN bundle");
  }
  for (const version of ["3.0.1", "3.3.1", "3.5.0", "3.6.0"]) {
    assert.equal(resolveImport(`tailwind-merge@${version}`, v), `https://esm.sh/tailwind-merge@${version}?bundle`, "tailwind-merge has no React dependency and keeps its exact version");
  }
  assert.equal(resolveImport("@headlessui/react@2.2.9", v), "https://esm.sh/@headlessui/react@2.2.9?deps=react@19.3.0,react-dom@19.3.0", "React component packages still share the renderer's React instance");
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
  assert.match(code, /const PREVIEW_THEME = "dark"/);
  assert.match(code, /forceColorScheme=\{PREVIEW_THEME\}/);
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
    const response = tools.invoke("render_component", { id: "shadcn-svelte/Button", format });
    assert.equal(response.structuredContent.status, "unavailable");
    assert.equal(response.structuredContent.preview.available, false);
    assert.equal(response.structuredContent.preview.code, undefined);
    assert.match(response.structuredContent.gaps.join(" "), /Svelte compiler/);
    assert.doesNotMatch(response.structuredContent.html ?? "", /<iframe|<script/);
  }
  assert.equal(tools.invoke("render_component", { id: "mantine/Invented" }).isError, true);
  const restricted = createCatalogueTools({ ...data, libraries: libraries.map((entry) => entry.slug === "mantine" ? { ...entry, outboundOnly: true } : entry) });
  assert.equal(restricted.invoke("render_component", { id: "mantine/Button" }).structuredContent.status, "unavailable");
  assert.equal(restricted.invoke("get_component", { id: "mantine/Button" }).structuredContent.preview.available, false);
});

test("discovery and rendering agree on actual source or pinned package coverage", () => {
  const tools = createCatalogueTools(data);
  const available = new Set();
  for (const [slug, entries] of Object.entries(componentIndex)) {
    for (const component of entries) {
      const id = `${slug}/${component.name}`;
      const support = tools.invoke("get_component", { id }).structuredContent.preview;
      if (!support.available) continue;
      available.add(id);
      const rendered = tools.invoke("render_component", { id });
      assert.notEqual(rendered.isError, true, `Advertised component cannot render: ${id}: ${JSON.stringify(rendered.structuredContent)}`);
      const preview = rendered.structuredContent.preview;
      const ast = parseTsx(preview.code, { sourceType: "module", plugins: ["jsx"] });
      const imports = ast.program.body.filter((node) => node.type === "ImportDeclaration");
      if (support.source) {
        assert.match(support.source.url, /^https:\/\/(?:github\.com\/|ui\.shadcn\.com\/|git\.cafe\/versecafe\/quoin\/)/, id);
        assert.match(support.source.integrity, /^sha256:[a-f0-9]{64}$/, id);
      } else {
        const packageId = `${support.package}@${support.version}`;
        const bundled = packageBundles[packageId] ?? supplementalBundles[packageId];
        if (bundled) {
          assert.equal(bundled.source.package, support.package);
          assert.equal(bundled.source.version, support.version);
          assert.equal(bundled.source.integrity, "sha256:" + createHash("sha256").update(bundled.code).digest("hex"), `Modified official package bundle: ${id}`);
          assert.ok(preview.code.includes(bundled.code), `Official package bytes missing from preview: ${id}`);
        } else assert.ok(imports.some((node) => node.source.value.startsWith(packageId)), `No recorded package import for ${id}`);
      }
      assert.equal(preview.docsUrl, component.url);
      assert.ok(preview.gaps.length >= 3);
    }
  }
  for (const id of ["mantine/Button", "radix-ui/Dialog", "magic-ui/Aurora Text", "cult-ui/Terminal Animation", "kibo-ui/Announcement", "intent-ui/Button", "reui/Number Field", "elevenlabs-ui/Waveform", "tween-ui/Glow Button", "hextaui/Button", "beui/Button", "loading-dev/Arc", "web-awesome/Button"]) {
    assert.ok(available.has(id), `Reviewed library coverage disappeared: ${id}`);
  }
  assert.equal(available.has("shadcn-svelte/Button"), false);
});

test("committed official bundles have valid identities, intact CSS and mountable runtime defaults", () => {
  const digest = (text) => "sha256:" + createHash("sha256").update(text).digest("hex");
  const catalogueIds = new Set(Object.entries(componentIndex).flatMap(([slug, components]) => components.map(component => `${slug}/${component.name}`)));
  for (const [id, preview] of Object.entries(extraSources.entries)) {
    assert.ok(catalogueIds.has(id), `Source preview has no catalogue identity: ${id}`);
    assert.equal(preview.source.integrity, digest(preview.code), `Modified compiled source: ${id}`);
    assert.ok(preview.source.files.length > 0, `Missing upstream dependency closure: ${id}`);
    for (const file of preview.source.files) {
      assert.match(file.sha256, /^[a-f0-9]{64}$/, `${id}: ${file.url}`);
      assert.equal(extraSources.sourcePins[file.url], file.sha256, `Rebuild pin differs from reviewed component source: ${file.url}`);
      assert.ok(file.url.includes(preview.source.revision) || /^https:\/\/cdn\.jsdelivr\.net\/npm\/(?:next@\d|process@0\.11\.10\/)/.test(file.url), `Unpinned source: ${file.url}`);
    }
    const [, exports] = parseModule(preview.code);
    const declaration = exports.find(entry => entry.name === "default");
    assert.ok(declaration, `Official bundle lost its runtime default: ${id}`);
    const mounted = mountable(preview.code, declaration, 7);
    assert.doesNotThrow(() => parseTsx(mounted, { sourceType: "module" }), `Mount transformation broke ${id}`);
    assert.match(mounted, /window\.__colMount\([^,]+, 7\)/, id);
    assert.doesNotMatch(mounted, /window\.__colMount\((?:undefined|null),/, id);
    assert.ok(Object.hasOwn(extraSources.styles, preview.styleKey), `Missing required CSS: ${id}`);
    if (!id.startsWith("loading-dev/")) assert.ok(extraSources.styles[preview.styleKey].length > 100, `Empty upstream theme: ${id}`);
  }
  for (const [key, css] of Object.entries(extraSources.styles)) assert.equal(extraSources.styleIntegrities[key], digest(css), `Modified compiled CSS: ${key}`);
  for (const files of Object.values(extraSources.styleSources)) for (const file of files) {
    assert.equal(extraSources.sourcePins[file.url], file.sha256, `Rebuild pin differs from reviewed stylesheet source: ${file.url}`);
    if (file.url.startsWith("npm-plugin-lock:")) {
      assert.equal("sha256:" + file.sha256, digest(file.lockfile), `CSS plugin lockfile is missing or changed: ${file.url}`);
      assert.ok(JSON.parse(file.lockfile).lockfileVersion >= 2, "Plugin dependencies need integrity-bearing npm lockfiles");
    }
  }
  for (const id of Object.keys(extraSources.unavailable)) {
    assert.ok(catalogueIds.has(id), `Unknown unavailable identity: ${id}`);
    assert.equal(Object.hasOwn(extraSources.entries, id), false, `Failed bundle still available: ${id}`);
  }
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
  assert.equal(actual.structuredContent.preview.code, undefined);
  assert.equal(JSON.parse(actual.content[0].text).preview.code, undefined);
  assert.equal(actual.structuredContent.preview.media, undefined);
  assert.equal(JSON.parse(actual.content[0].text).preview.media, undefined);
  assert.equal(actual._meta["col/preview"].requestKey, actual.structuredContent.preview.requestKey);
  assert.match(actual._meta["col/preview"].code, /@mantine\/core@9\.7\.1/);
  assert.ok(actual.content[0].text.length < 10_000, "model text must not contain the source bundle");
  const mediaResult = await request("tools/call", { name: "render_component", arguments: { id: "cult-ui/Bg Media" } });
  assert.equal(mediaResult.structuredContent.preview.media, undefined);
  assert.equal(JSON.parse(mediaResult.content[0].text).preview.media, undefined);
  const descriptors = Object.values(mediaResult._meta["col/preview"].media);
  assert.equal(descriptors.length, 1);
  assert.ok(JSON.stringify(mediaResult).length < 1_000_000, "the tool result must contain descriptors, not original video bytes");
  for (const index of [0, descriptors[0].chunks.length - 1]) {
    const uri = `${descriptors[0].uri}/${index}`;
    const resource = await request("resources/read", { uri });
    assert.equal(resource.contents[0].uri, uri);
    assert.ok(resource.contents[0].blob.length <= 2_000_000);
    assert.equal(createHash("sha256").update(Buffer.from(resource.contents[0].blob, "base64")).digest("hex"), descriptors[0].chunks[index]);
  }
  const mediaHtml = await request("tools/call", { name: "render_component", arguments: { id: "cult-ui/Bg Media", format: "html" } });
  assert.equal(mediaHtml.structuredContent.status, "unavailable");
  assert.match(mediaHtml.structuredContent.html, /bounded MCP Apps resource reads/);
  const fallback = await request("tools/call", { name: "render_component", arguments: { id: "mantine/Button", format: "html" } });
  assert.match(fallback.structuredContent.html, /iframe/);
  assert.match(fallback.structuredContent.preview.code, /@mantine\/core@9\.7\.1/);
  assert.equal(fallback._meta, undefined, "HTML remains directly usable by text-only clients");

  const { contents } = await request("resources/read", { uri: PREVIEW_WIDGET_URI });
  assert.equal(contents[0].mimeType, PREVIEW_WIDGET_MIME);
  assert.deepEqual(contents[0]._meta.ui.csp.resourceDomains, ["https://esm.sh", "https://cdn.jsdelivr.net"]);
  await server.close();
});
