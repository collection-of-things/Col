/**
 * The renderer behind `render_component`: turns the TSX module the agent wrote
 * into a live React render inside the user's chat. It ships in two shells that
 * share one runtime (`runtimeScript`):
 *
 * - `previewWidgetHtml()`: the MCP Apps view. The tool's `_meta.ui.resourceUri`
 *   points here; MCP Apps hosts load it in a sandboxed iframe and pass it the
 *   tool arguments through the official ext-apps `App` bridge.
 * - `previewFragmentHtml(code)`: a self-contained HTML fragment with the code
 *   embedded, returned by `render_component({ format: "html" })` for hosts that
 *   cannot show MCP Apps, such as Claude Code. It isolates the render in an
 *   `<iframe srcdoc>` so the host's CSS cannot restyle it. The agent passes it
 *   to an inline HTML widget tool, or saves it as a file and opens it in a browser.
 *
 * The runtime compiles the TSX with sucrase, points the module's imports at
 * esm.sh, and mounts its default export with React. Col bundles nothing: every
 * package loads from esm.sh, with `?deps=` pinning React so the render and every
 * package share one React without an import map.
 */
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

/** Pinned runtime modules. Each version is at least two weeks old at the time it was pinned. */
const RUNTIME = {
  react: `https://esm.sh/react@${REACT_VERSION}`,
  reactDomClient: `https://esm.sh/react-dom@${REACT_VERSION}/client?deps=react@${REACT_VERSION}`,
  sucrase: "https://esm.sh/sucrase@3.35.1",
  lexer: "https://esm.sh/es-module-lexer@3.0.2/js",
  tailwind: "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.3",
  apps: "https://esm.sh/@modelcontextprotocol/ext-apps@2.0.3/app-with-deps",
} as const;


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
  const [{ createElement }, { createRoot }, { transform }, { init, parse }] = await Promise.all([
    import(${JSON.stringify(RUNTIME.react)}),
    import(${JSON.stringify(RUNTIME.reactDomClient)}),
    import(${JSON.stringify(RUNTIME.sucrase)}),
    import(${JSON.stringify(RUNTIME.lexer)}),
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
  window.addEventListener("error", (event) => fail(event.error || event.message));
  window.addEventListener("unhandledrejection", (event) => fail(event.reason));

  async function render(code) {
    const current = ++generation;
    resources.forEach((resource) => resource.remove());
    resources = [];
    status.textContent = "Rendering…";
    status.hidden = false;
    try {
    const options = { transforms: ["typescript", "jsx"], jsxRuntime: "automatic", production: true };
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
        link.addEventListener("error", () => fail("Stylesheet failed to load: " + entry.specifier, current));
        resources.push(link);
        document.head.append(link);
        out += js.slice(last, entry.importStart);
        last = entry.importEnd;
      } else {
        out += js.slice(last, entry.start) + (entry.type === "dynamic" ? JSON.stringify(url) : url);
        last = entry.end;
      }
    }
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
function previewPage(script: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<title>Component preview</title>
<script src="${RUNTIME.tailwind}"></script>
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

/** The Apps bridge replaces the complete execution document on each input. Old
 * modules, promises and event handlers cannot affect a corrected preview. */
export function previewWidgetHtml(): string {
  const marker = "COL_CODE_PLACEHOLDER";
  const [before, after] = previewCodePage(marker).split(marker);
  const literal = (value: string) => JSON.stringify(value).replace(/</g, "\\u003c");
  return previewPage(`<script type="module">
  import { App, applyDocumentTheme } from "${RUNTIME.apps}";
  const app = new App({ name: "Col component preview", version: "1.0.0" });
  const report = (message) => Promise.resolve()
    .then(() => app.updateModelContext({ content: [{ type: "text", text: "render_component failed in the chat: " + message }] }))
    .catch(() => {});
  let frame;
  let theme;
  function setTheme(value) {
    theme = value;
    applyDocumentTheme(value);
    frame?.contentWindow?.postMessage({ colTheme: value }, "*");
  }
  app.ontoolinput = (params) => {
    const code = params.arguments && params.arguments.code;
    const status = document.getElementById("col-status");
    frame?.remove();
    frame = undefined;
    if (typeof code !== "string") {
      status.hidden = false;
      status.textContent = "render_component was called without code";
      report(status.textContent);
      return;
    }
    status.hidden = true;
    frame = document.createElement("iframe");
    frame.title = "Component preview";
    frame.setAttribute("sandbox", "allow-scripts allow-forms");
    frame.style.cssText = "display:block;width:100%;height:360px;border:0";
    frame.srcdoc = ${literal(before)} + JSON.stringify(code).replace(/</g, "\\u003c") + ${literal(after)};
    frame.addEventListener("load", () => { if (theme) setTheme(theme); });
    document.getElementById("col-root").replaceChildren(frame);
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
</script>`);
}

/** One execution document, shared by both shells. The argument is already a
 * safely embedded JSON expression, never executable component source. */
function previewCodePage(embedded: string): string {
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
</script>`);
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
export function previewFragmentHtml(code: string): string {
  const embedded = JSON.stringify(code).replace(/</g, "\\u003c");
  const page = previewCodePage(embedded);
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
