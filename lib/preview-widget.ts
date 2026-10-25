/**
 * The renderer behind `render_component`: turns the server-selected library composition
 * into a live React render inside the user's chat. It ships in two shells that
 * share one runtime (`runtimeScript`):
 *
 * - `previewWidgetHtml()`: the MCP Apps view. The tool's `_meta.ui.resourceUri`
 *   points here; MCP Apps hosts load it in a sandboxed iframe and pass it the
 *   tool result through the official ext-apps `App` bridge.
 * - `verifiedPreviewFragmentHtml(preview)`: an HTML fragment with provenance and code
 *   embedded, returned by `render_component({ format: "html" })` for hosts that
 *   cannot show MCP Apps, such as Claude Code. It isolates the render in an
 *   `<iframe srcdoc>` so the host's CSS cannot restyle it. The agent passes it
 *   to an inline HTML widget tool, or saves it as a file and opens it in a browser.
 *
 * The runtime validates TSX with Babel, compiles it with sucrase, points imports at
 * esm.sh, and mounts its default export with React. Verified upstream source and
 * selected npm dependencies are bundled ahead of time. Remaining packages load
 * from esm.sh with shared React pins; there is no runtime source substitution.
 */
import type { parse as parseTsx } from "@babel/parser";
import type { ComponentPreview } from "./component-preview";
import { componentPreviewRequestKey } from "./component-preview.ts";

export const PREVIEW_WIDGET_URI = "ui://col/render-component.html";

/**
 * What turns `previewFragmentHtml` output into a standalone page. The charset
 * keeps non-ASCII text intact; the color scheme makes the page canvas follow the
 * system theme, which Tailwind's `dark:` variant also follows, so dark styles
 * never land on a light page.
 */
export const FRAGMENT_PAGE_PREFIX = '<!doctype html><meta charset="utf-8"><meta name="color-scheme" content="light dark">';

/** The standard MCP Apps UI resource mime type. */
export const PREVIEW_WIDGET_MIME = "text/html;profile=mcp-app";

/** Script and style origins the renderer loads from. Hosts deny everything else (MCP Apps default CSP). */
export const PREVIEW_WIDGET_CSP = { resourceDomains: ["https://esm.sh", "https://cdn.jsdelivr.net"] };

const REACT_VERSION = "19.3.0";
const APPS_ZOD_VERSION = "4.6.5";

/** Pinned runtime modules. Each version is at least two weeks old at the time it was pinned. */
const RUNTIME = {
  react: `https://esm.sh/react@${REACT_VERSION}`,
  reactDomClient: `https://esm.sh/react-dom@${REACT_VERSION}/client?deps=react@${REACT_VERSION}`,
  sucrase: "https://esm.sh/sucrase@3.35.1",
  syntax: "https://esm.sh/@babel/parser@7.28.5",
  lexer: "https://esm.sh/es-module-lexer@3.0.2/js",
  tailwind: "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.3",
  appsZod: `https://esm.sh/zod@${APPS_ZOD_VERSION}/v4`,
  apps: `https://esm.sh/@modelcontextprotocol/ext-apps@2.0.3?deps=@modelcontextprotocol/client@2.0.0,@modelcontextprotocol/core@2.0.0,zod@${APPS_ZOD_VERSION}`,
} as const;

/** Reject malformed TSX before compilation or execution. Sucrase deliberately
 * skips some syntax checks, including matching JSX tags. Embedded via
 * `toString()`, so this function must have no outside runtime references. */
export const validatePreviewSyntax = (code: string, parse: typeof parseTsx): void => {
  try {
    parse(code, { sourceType: "module", plugins: ["jsx", "typescript"], errorRecovery: false, attachComment: false });
  } catch (error) {
    // Parser messages can include user source. Report only its location.
    const loc = error instanceof Error && "loc" in error ? error.loc : undefined;
    const location = loc && typeof loc === "object" && "line" in loc && "column" in loc
      && typeof loc.line === "number" && typeof loc.column === "number"
      ? ` at line ${loc.line}, column ${loc.column + 1}` : "";
    throw new Error(`Invalid TSX${location}. Check matching JSX tags, fragments, and module syntax.`);
  }
};


/**
 * Where one import in the agent's code loads from. React and react-dom resolve
 * to the pinned copies; other packages come from esm.sh with React pinned by
 * `?deps=`, which esm.sh resolves to those same module URLs. Local files cannot
 * be served, so they throw and the message tells the agent to inline them.
 *
 * ponytail: embedded in the runtime via `toString()`, so it must stay a
 * self-contained arrow function with no outside references.
 */
export const resolveImport = (specifier: string, reactVersion: string): string => {
  if (specifier === "server-only" || /^(node:|file:|data:|javascript:|http:)/.test(specifier)) {
    throw new Error("This preview supports browser modules and HTTPS imports; server-only modules and other URL schemes are unsupported");
  }
  const react = specifier.match(/^react(\/.*)?$/);
  if (react) return `https://esm.sh/react@${reactVersion}${react[1] ?? ""}`;
  const reactDom = specifier.match(/^react-dom(\/.*)?$/);
  if (reactDom) return `https://esm.sh/react-dom@${reactVersion}${reactDom[1] ?? ""}?deps=react@${reactVersion}`;
  if (specifier.startsWith("https://")) return specifier;
  if (/^(\.|\/|@\/|~\/)/.test(specifier)) {
    throw new Error(`"${specifier}" is a local file; inline its code in the module instead`);
  }
  if (specifier.endsWith(".css")) return `https://esm.sh/${specifier}`;
  // These pinned class utilities have no React dependency. Avoid an unnecessary
  // React-specific CDN build variant while preserving the audited versions.
  if (/^cn@0\.(?:2\.4|5\.0)$/.test(specifier)) return "https://esm.sh/" + specifier + "?bundle";
  if (/^tailwind-merge@3\.(?:0\.1|3\.1|5\.0|6\.0)$/.test(specifier)) return "https://esm.sh/" + specifier + "?bundle";
  return `https://esm.sh/${specifier}?deps=react@${reactVersion},react-dom@${reactVersion}`;
};

/**
 * Turns the compiled module into one that mounts itself: its default export
 * is handed to the runtime's `__colMount`. The module parser supplies the real
 * declaration, so comments and strings cannot masquerade as an export.
 * Embedded via `toString()` like `resolveImport`; keep it self-contained.
 */
export const mountable = (js: string, declaration?: { type: string; name: string; localName?: string; exportStart: number; end: number }, generation = 0): string => {
  if (!declaration || declaration.type !== "direct" || declaration.name !== "default") {
    throw new Error("The module needs `export default` of a React component");
  }
  let local = declaration.localName;
  if (!local) {
    local = "__ColComponent";
    while (js.includes(local)) local += "_";
    js = js.slice(0, declaration.exportStart) + `const ${local} = ` + js.slice(declaration.end);
  }
  return `${js}\nwindow.__colMount(${local}, ${generation});\n`;
};

/**
 * The shared runtime: defines `colRuntime(report?)`, which loads React and the
 * compiler, then resolves to `{ render(code), fail(error) }`. Failures show in
 * `#col-status`; `report` also forwards them, e.g. to the agent's context.
 * Uses only dynamic `import()`, so it runs in classic and module scripts alike.
 */
function runtimeScript(): string {
  return `
async function colRuntime(report) {
  const resolveImport = ${resolveImport.toString()};
  const mountable = ${mountable.toString()};
  const validatePreviewSyntax = ${validatePreviewSyntax.toString()};
  const [{ createElement }, { createRoot }, { transform }, { init, parse }, { parse: parseSyntax }] = await Promise.all([
    import(${JSON.stringify(RUNTIME.react)}),
    import(${JSON.stringify(RUNTIME.reactDomClient)}),
    import(${JSON.stringify(RUNTIME.sucrase)}),
    import(${JSON.stringify(RUNTIME.lexer)}),
    import(${JSON.stringify(RUNTIME.syntax)}),
  ]);
  const status = document.getElementById("col-status");
  let generation = 0;
  let failedGeneration = -1;
  let resources = [];
  function fail(error, current = generation) {
    if (current !== generation) return;
    failedGeneration = current;
    const message = String((error && error.message) || error).slice(0, 256);
    status.textContent = message;
    status.hidden = false;
    if (report) report(message);
  }
  const root = createRoot(document.getElementById("col-root"), { onUncaughtError: (error) => fail(error) });
  window.__colMount = (Component, current) => {
    if (current !== generation) return;
    const wrappedComponent = Component && [Symbol.for("react.memo"), Symbol.for("react.forward_ref"), Symbol.for("react.lazy")].includes(Component.$$typeof);
    if (!Component || Component.constructor?.name === "AsyncFunction" || typeof Component.then === "function" || (typeof Component !== "function" && !wrappedComponent)) {
      fail("Export a synchronous browser React component; async/server components are unsupported", current);
      return;
    }
    status.hidden = failedGeneration !== current;
    root.render(createElement(Component));
  };
  window.addEventListener("error", (event) => {
    if (event.target instanceof HTMLImageElement || event.target instanceof HTMLMediaElement) {
      fail("An upstream image or media asset could not load. This preview cannot fully reproduce it.");
    } else if (event instanceof ErrorEvent) fail(event.error || event.message);
  }, true);
  window.addEventListener("unhandledrejection", (event) => fail(event.reason));
  window.addEventListener("securitypolicyviolation", (event) => fail("Preview resource blocked by CSP: " + event.effectiveDirective));

  async function render(code) {
    const current = ++generation;
    resources.forEach((resource) => resource.remove());
    resources = [];
    status.textContent = "Rendering…";
    status.hidden = false;
    try {
    validatePreviewSyntax(code, parseSyntax);
    // The client already runs ES modules. Preserve upstream JavaScript operators;
    // only TS/JSX needs compilation, including when upstream output is minified.
    const options = { transforms: ["typescript", "jsx"], jsxRuntime: "automatic", production: true, disableESTransforms: true };
    const js = transform(code, options).code;
    await init();
    if (current !== generation) return;
    // Validate written imports, but execute normal TS output so implicit type
    // imports (e.g. ReactNode) do not become nonexistent browser exports.
    const writtenImports = parse(transform(code, { ...options, keepUnusedImports: true }).code)[0];
    for (const entry of writtenImports) {
      if (entry.type === "import-meta") continue;
      if (!entry.specifier || entry.glob || entry.phase) throw new Error("Use literal browser imports; computed and source/defer imports are unsupported");
      resolveImport(entry.specifier, ${JSON.stringify(REACT_VERSION)});
    }
    const [imports] = parse(js);
    const stylesheets = [];
    const modules = [];
    let out = "";
    let last = 0;
    for (const entry of imports) {
      if (entry.type === "import-meta") continue;
      if (!entry.specifier || entry.glob || entry.phase) throw new Error("Use literal browser imports; computed and source/defer imports are unsupported");
      const url = resolveImport(entry.specifier, ${JSON.stringify(REACT_VERSION)});
      if (entry.specifier.endsWith(".css")) {
        const prefix = js.slice(entry.importStart, entry.start - 1).replace(/\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\r\\n]*/g, "").trim();
        if (entry.type !== "static" || prefix !== "import") throw new Error("Import CSS as a side-effect stylesheet: import 'package/styles.css'");
        // Browsers cannot import CSS as a module: load it as a stylesheet and drop the statement.
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        stylesheets.push(new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("Stylesheet timed out: " + entry.specifier)), 15000);
          link.addEventListener("load", () => { clearTimeout(timer); resolve(); }, { once: true });
          link.addEventListener("error", () => { clearTimeout(timer); reject(new Error("Stylesheet failed to load: " + entry.specifier)); }, { once: true });
        }));
        resources.push(link);
        document.head.append(link);
        out += js.slice(last, entry.importStart);
        last = entry.importEnd;
      } else {
        if (entry.type === "static") modules.push(import(url).catch((error) => {
          throw new Error("Could not load " + entry.specifier + ": " + error.message);
        }));
        out += js.slice(last, entry.start) + (entry.type === "dynamic" ? JSON.stringify(url) : url);
        last = entry.end;
      }
    }
    await Promise.all([...stylesheets, ...modules]);
    if (current !== generation) return;
    const script = document.createElement("script");
    script.type = "module";
    const resolved = out + js.slice(last);
    const [, exports] = parse(resolved);
    script.textContent = mountable(resolved, exports.find((entry) => entry.name === "default"), current);
    script.addEventListener("error", () => fail("A browser module failed to load; check its HTTPS URL and browser support", current));
    resources.push(script);
    document.body.append(script);
    } catch (error) { fail(error, current); }
  }
  return { render, fail };
}
`;
}

/**
 * The document every render runs in: Tailwind, a status line for failures, and
 * the mount point. `script` boots the runtime for the shell that uses it.
 */
function previewPage(script: string, tailwind = true): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<title>Component preview</title>
${tailwind ? `<script src="${RUNTIME.tailwind}"></script>` : ""}
<style>
  body { margin: 0; padding: 16px; background: transparent; color: light-dark(#000, #fff); font: 14px/1.5 system-ui, sans-serif; }
  html { min-height: 360px; }
  #col-status { margin: 0; white-space: pre-wrap; }
</style>
</head>
<body>
<p id="col-status">Rendering…</p>
<div id="col-root"></div>
${script}
</body>
</html>
`;
}

/** The Apps bridge clears on input and renders only its matching server result. Old
 * modules, promises and event handlers cannot affect a corrected preview. */
export function previewWidgetHtml(): string {
  const marker = "COL_CODE_PLACEHOLDER";
  const [before, after] = previewCodePage(marker, true).split(marker);
  const literal = (value: string) => JSON.stringify(value).replace(/</g, "\\u003c");
  return previewPage(`<script type="module">
  import { config } from "${RUNTIME.appsZod}";
  // SDK schemas are created during import, before App's own jitless default.
  // Use the shared Zod instance; app-with-deps hides its own unconfigurable copy.
  config({ jitless: true });
  const { App, applyDocumentTheme } = await import("${RUNTIME.apps}");
  const app = new App({ name: "Col component preview", version: "1.0.0" });
  const report = (message) => Promise.resolve()
    .then(() => app.updateModelContext({ content: [{ type: "text", text: "render_component failed in the chat: " + message }] }))
    .catch(() => {});
  let frame;
  let requestKey;
  function setTheme(value) {
    applyDocumentTheme(value);
  }
  app.ontoolinput = (params) => {
    const args = params.arguments ?? {};
    requestKey = (${componentPreviewRequestKey.toString()})(args);
    const status = document.getElementById("col-status");
    frame?.remove();
    frame = undefined;
    document.getElementById("col-root").replaceChildren();
    status.hidden = false;
    status.textContent = "Preview unavailable until a verified library result is received.";
  };
  app.ontoolresult = (result) => {
    const status = document.getElementById("col-status");
    if (result.isError) {
      // SDK-level errors may have no request identity. The host displays those;
      // they must not overwrite a newer preview with an unrelated failure.
      if (result.structuredContent?.requestKey !== requestKey) return;
      status.hidden = false;
      status.textContent = "Preview unavailable: " + String(result.structuredContent.error).slice(0, 256);
      return;
    }
    const preview = result.structuredContent?.preview;
    if (!preview || preview.requestKey !== requestKey) return;
    status.hidden = true;
    frame?.remove();
    frame = undefined;
    document.getElementById("col-root").innerHTML = (${previewDisclosure.toString()})(preview);
    if (!preview.available) return;
    const source = result._meta?.["col/preview"];
    const code = source?.requestKey === requestKey ? source.code : preview.code;
    if (typeof code !== "string") {
      status.hidden = false;
      status.textContent = "Preview unavailable: the client did not deliver the verified source payload.";
      return;
    }
    frame = document.createElement("iframe");
    frame.title = "Component preview";
    frame.setAttribute("sandbox", "allow-scripts allow-forms");
    frame.style.cssText = "display:block;width:100%;height:360px;border:0";
    frame.srcdoc = ${literal(before)} + JSON.stringify(code).replace(/</g, "\\u003c") + ${literal(after)};
    document.getElementById("col-root").append(frame);
  };
  addEventListener("message", (event) => {
    if (!frame || event.source !== frame.contentWindow) return;
    if (typeof event.data?.colError === "string") report(event.data.colError.slice(0, 256));
    const height = event.data?.colHeight;
    if (Number.isFinite(height) && height > 0 && height <= 900) frame.style.height = Math.max(360, Math.ceil(height)) + "px";
  });
  app.onhostcontextchanged = (context) => { if (context.theme) setTheme(context.theme); };
  await app.connect();
  const context = app.getHostContext();
  if (context?.theme) setTheme(context.theme);
</script>`, false);
}

/** One execution document, shared by both shells. The argument is already a
 * safely embedded JSON expression, never executable component source. */
function previewCodePage(embedded: string, trusted = false): string {
  return previewPage(`<script>
${runtimeScript()}
colRuntime((message) => parent.postMessage({ colError: message }, "*"))
  .then(({ render, fail }) => render(${embedded}).catch(fail))
  .catch((error) => {
    const message = String((error && error.message) || error).slice(0, 256);
    document.getElementById("col-status").textContent = message;
    parent.postMessage({ colError: message }, "*");
  });
addEventListener("message", (event) => {
  if (event.source !== parent || !["light", "dark"].includes(event.data?.colTheme)) return;
  document.documentElement.style.colorScheme = event.data.colTheme;
  document.documentElement.classList.toggle("dark", event.data.colTheme === "dark");
});
let lastHeight = 0;
let viewportHeight = innerHeight;
let viewportWidth = innerWidth;
let viewportDrivenHeight;
addEventListener("resize", () => {
  const heightOnlyResize = innerHeight !== viewportHeight && innerWidth === viewportWidth;
  viewportHeight = innerHeight;
  viewportWidth = innerWidth;
  viewportDrivenHeight = heightOnlyResize ? document.body.getBoundingClientRect().height : undefined;
});
const observer = new ResizeObserver(() => {
  const bodyHeight = document.body.getBoundingClientRect().height;
  // A parent height update must not feed viewport units back into another update.
  if (bodyHeight === viewportDrivenHeight) { viewportDrivenHeight = undefined; return; }
  viewportDrivenHeight = undefined;
  const height = Math.max(360, Math.min(900, Math.ceil(bodyHeight)));
  if (height !== lastHeight) {
    lastHeight = height;
    parent.postMessage({ colHeight: height }, "*");
  }
});
observer.observe(document.body);
addEventListener("pagehide", () => observer.disconnect(), { once: true });
</script>`, !trusted);
}

/**
 * The same render with the code embedded, for hosts without MCP Apps. It is an
 * HTML fragment, which inline HTML widget tools accept, holding the page in an
 * `<iframe srcdoc>`: the frame is a clean document, so a host's own CSS (Claude
 * Code's widget restyles every input) cannot reach the component. The frame
 * inherits the host's script allowlist, and reports its height so it fits the
 * render. Saved after `FRAGMENT_PAGE_PREFIX`, it also opens in any browser.
 * The code rides a JSON string with `<` escaped, so it cannot close its script
 * element early.
 */
export function previewFragmentHtml(code: string, trusted = false): string {
  const embedded = JSON.stringify(code).replace(/</g, "\\u003c");
  const page = previewCodePage(embedded, trusted);
  const srcdoc = page.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return `<iframe data-col-preview title="Component preview" sandbox="allow-scripts allow-forms" srcdoc="${srcdoc}" style="display:block;width:100%;height:360px;border:0"></iframe>
<script>
(() => {
  const frame = document.currentScript.previousElementSibling;
  function resize(event) {
    if (!frame.isConnected) { removeEventListener("message", resize); return; }
    const height = event.data?.colHeight;
    if (event.source === frame.contentWindow && Number.isFinite(height) && height > 0 && height <= 900) {
      frame.style.height = Math.max(360, Math.ceil(height)) + "px";
    }
  }
  addEventListener("message", resize);
  const cleanup = new MutationObserver(() => {
    if (!frame.isConnected) { removeEventListener("message", resize); cleanup.disconnect(); }
  });
  cleanup.observe(document.documentElement, { childList: true, subtree: true });
})();
</script>
`;
}

/** Kept outside the execution frame so user CSS cannot hide provenance or gaps.
 * Self-contained because the widget embeds this function into its bridge. */
function previewDisclosure(preview: ComponentPreview): string {
  const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
  const identity = preview.available
    ? `Library implementation: ${escape(preview.id)} — ${escape(preview.package)}@${escape(preview.version)}, export ${escape(preview.exportName)}.`
    : `Preview unavailable: ${escape(preview.id)}.`;
  const source = preview.available && preview.source
    ? `<p><a href="${escape(preview.source.url)}" target="_blank" rel="noreferrer">Pinned upstream source</a> · ${escape(preview.source.integrity)}</p>` : "";
  const assets = preview.available && preview.assets?.length
    ? `<details><summary>Original demo images (${preview.assets.length})</summary><ul>${preview.assets.map(asset => `<li><a href="${escape(asset.downloadUrl)}" target="_blank" rel="noreferrer">${escape(asset.url)}</a> · ${escape(asset.attribution.name)} · ${escape(asset.attribution.license)} · SHA-256 ${escape(asset.sha256)}</li>`).join("")}</ul></details>` : "";
  return `<section data-col-provenance aria-label="Preview source and limitations"><p>${identity} <a href="${escape(preview.docsUrl)}" target="_blank" rel="noreferrer">Official documentation</a></p>${source}${assets}<p>Reproduction limits</p><ul>${preview.gaps.map((gap) => `<li>${escape(gap)}</li>`).join("")}</ul></section>`;
}

/** The fallback consumes exactly the same server-selected implementation. */
export function verifiedPreviewFragmentHtml(preview: ComponentPreview): string {
  return previewDisclosure(preview) + (preview.available ? previewFragmentHtml(preview.code, true) : "");
}
