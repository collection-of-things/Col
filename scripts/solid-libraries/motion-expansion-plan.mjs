import { readFile, writeFile, mkdir } from "node:fs/promises";
import { parse } from "@babel/parser";
import { resolveMotionImport } from "./motion-source-graph.mjs";

const readJson = async path => JSON.parse(await readFile(path, "utf8"));
const walk = (node, visit) => { if (!node || typeof node !== "object") return; if (Array.isArray(node)) { for (const child of node) walk(child, visit); return; } visit(node); for (const [key, value] of Object.entries(node)) if (!["loc", "comments", "tokens"].includes(key)) walk(value, visit); };
const jsxName = node => node?.type === "JSXIdentifier" ? node.name : "";
const syntax = code => parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
const packageName = name => name.startsWith("@") ? name.split("/").slice(0, 2).join("/") : name.split("/")[0];

for (const slug of ["nikala-ui", "magicui-solid", "mystic-ui"]) {
  const directory = `data/solid-libraries/${slug}`;
  const upstream = await readJson(`${directory}/upstream.json`);
  const coverage = await readJson(`${directory}/coverage.json`);
  const pages = await readJson(`${directory}/page-verification.json`);
  const output = [];
  const resolveImport = (importer, name) => resolveMotionImport(slug, upstream.files, importer, name);
  for (const item of coverage.documentationInventory) {
    const componentSlug = new URL(item.url).pathname.split("/").filter(Boolean).at(-1);
    const record = { id: `${slug}/${item.name}`, name: item.name, slug: componentSlug, url: item.url, sourceRevision: upstream.revision, checkedAt: pages.checkedAt };
    const verifiedPage = pages.entries.find(page => page.url === item.url);
    if (verifiedPage?.status !== 200) { output.push({ ...record, gap: verifiedPage?.error ?? "Official component page could not be verified" }); continue; }
    try {
      let module, code, componentSource, docsSource, exportName;
      if (slug === "nikala-ui") {
        docsSource = `apps/web/src/routes/docs/components/${componentSlug}.tsx`;
        const doc = upstream.files[docsSource]?.content;
        if (!doc) throw new Error("No pinned official documentation module exists for this URL");
        const ast = syntax(doc);
        const declaration = ast.program.body.find(node => node.type === "ExportDefaultDeclaration")?.declaration;
        if (!declaration?.body?.body) throw new Error("Documentation page does not expose a function-body demo");
        const returned = declaration.body.body.find(node => node.type === "ReturnStatement");
        let preview;
        walk(returned, node => { if (!preview && node.type === "JSXElement" && jsxName(node.openingElement.name) === "ComponentPreview") preview = node; });
        if (!preview) throw new Error("No ComponentPreview exists in the pinned documentation page");
        const imports = ast.program.body.filter(node => node.type === "ImportDeclaration" && !/^@\/components\/(?:seo|docs\/|component-preview|code-block$)/.test(node.source.value));
        const declarations = ast.program.body.filter(node => !["ImportDeclaration", "ExportDefaultDeclaration"].includes(node.type));
        const body = declaration.body.body.filter(node => node.type !== "ReturnStatement").map(node => doc.slice(node.start, node.end)).join("\n");
        const children = doc.slice(preview.openingElement.end, preview.closingElement.start);
        code = [...imports, ...declarations].map(node => doc.slice(node.start, node.end)).join("\n") + `\nexport default function Demo() {\n${body}\nreturn <>${children}</>;\n}\n`;
        module = `demos/${componentSlug}.tsx`;
        exportName = "default";
        componentSource = resolveImport(docsSource, `@/components/ui/${componentSlug}`);
        if (componentSlug === "theme-manager") {
          componentSource = "packages/core/src/registry/components/ui/theme-toggle.tsx";
          code = code.replace("export default function Demo()", "function Demo()");
          code += '\nimport { ThemeProvider } from "@/providers/theme-provider";\nexport default function ThemeDemo() { return <ThemeProvider defaultTheme={document.documentElement.classList.contains("dark") ? "dark" : "light"}><Demo /></ThemeProvider>; }\n';
          record.adaptation = "The documented ThemeToggle is wrapped in the library's required original ThemeProvider, initialized from the selected preview theme.";
        }
      } else if (slug === "magicui-solid") {
        docsSource = `src/content/docs/docs/components/${componentSlug}.mdx`;
        const doc = upstream.files[docsSource]?.content;
        exportName = doc?.match(/<DemoRenderer\s+demo="([^"]+)"/)?.[1];
        if(componentSlug==="blur-fade"){
          if(!doc.includes('demo="BlurFadeTextDemo"'))throw new Error("Official text example missing");
          exportName="BlurFadeTextDemo";
          record.adaptation="Uses the official BlurFadeTextDemo shown on the same documentation page, preserving the original blur/fade animation without requesting live stock photographs.";
        }
        if (!exportName) throw new Error("No first-party DemoRenderer example found in the pinned component page");
        module = `src/demos/${exportName}.tsx`;
        code = upstream.files[module]?.content;
        componentSource = resolveImport(module, `@/registry/magicui/${componentSlug}`);
        if (componentSlug === "tweet-card") {
          componentSource = "src/registry/magicui/client-tweet-card.tsx";
          module = "demos/tweet-card.tsx";
          exportName = "default";
          code = await readFile(`${directory}/${module}`, "utf8");
          record.adaptation = "Sample content, a generated avatar and a licensed video replace the live post and its media. The original MagicTweet export and documentation's centered preview layout are retained; the video reserves its 16:9 dimensions while loading. ClientTweetCard's loading and error states are not reproduced, and links cannot open inside the sandbox.";
        }
        if(componentSlug==="animated-theme-toggler"){
          module="demos/theme-toggler.tsx";exportName="default";
          code='import { createSignal } from "solid-js";\nimport { AnimatedThemeToggler } from "@/registry/magicui/animated-theme-toggler";\nexport default function ThemeTogglerDemo() { const [theme,setTheme]=createSignal<"light"|"dark">(document.documentElement.dataset.theme==="dark"?"dark":"light"); return <div class="flex justify-center p-6"><AnimatedThemeToggler theme={theme()} onThemeChange={setTheme} /></div>; }\n';
          record.adaptation="Uses the original component's documented controlled theme/onThemeChange API with the official demo wrapper. The parent owns in-memory state, so unavailable localStorage persistence is not requested; original styling and view-transition behavior are retained.";
        }
      } else {
        docsSource = `website/src/content/docs/${componentSlug}.mdx`;
        module = `components/tailwind/src/stories/${componentSlug}/default.tsx`;
        code = upstream.files[module]?.content;
        componentSource = `components/tailwind/src/ui/${componentSlug}.tsx`;
        exportName = "default";
        if(componentSlug === "android") {
          module = "demos/android.tsx";
          code = 'import { Android } from "@/ui/android";\nexport default function AndroidDemo() { return <Android />; }\n';
          record.adaptation = "The upstream Tailwind story imports Panda's generated styled-system. This preview mounts the genuine documented Android export with its original default SVG dimensions and styles; no Panda styles are substituted.";
        }
      }
      if (!code) throw new Error("The pinned library has no corresponding official Tailwind/Solid browser demo module");
      if (!upstream.files[componentSource]) throw new Error("The corresponding pinned component source is unavailable");
      syntax(code);
      const paths = new Set([componentSource]);
      const packages = new Set();
      const unresolved = new Set();
      const remote = new Set();
      const inspect = (path, source) => {
        if (/\.[jt]sx?$/.test(path)) {
          const ast = syntax(source);
          const imports = [];
          walk(ast, node => {
            if ((node.type === "ImportDeclaration" && node.importKind !== "type") || (node.type === "ExportNamedDeclaration" && node.source) || node.type === "ExportAllDeclaration") imports.push(node.source.value);
            if (node.type === "CallExpression" && node.callee.type === "Import" && node.arguments[0]?.type === "StringLiteral") imports.push(node.arguments[0].value);
            if (node.type === "StringLiteral" && /^https?:/.test(node.value) && !/github\.com.*(?:LICENSE|issues)|www\.w3\.org/.test(node.value)) remote.add(node.value);
          });
          for (const name of imports) {
            const resolved = resolveImport(path, name);
            if (resolved) { if (!paths.has(resolved)) { paths.add(resolved); inspect(resolved, upstream.files[resolved].content); } }
            else if (name.startsWith("@/") || name.startsWith(".")) unresolved.add(name);
            else packages.add(packageName(name));
          }
        }
      };
      inspect(module, code);
      // Always inspect the component itself, including a self-contained demo's imports.
      inspect(componentSource, upstream.files[componentSource].content);
      for(const template of upstream.assetTemplates??[]) if(template.module===module || paths.has(template.module)) for(const url of template.urls) remote.add(url);
      if (module.startsWith("demos/")) { await mkdir(`${directory}/demos`, { recursive: true }); await writeFile(`${directory}/${module}`, code); }
      output.push({ ...record, module, exportName, componentSource, docsSource, sourcePaths: [...paths].sort(), packages: [...packages].sort(), unresolved: [...unresolved], remoteUrls: [...remote].sort(), description: upstream.files[docsSource]?.content.match(/(?:description: |description=")([^\n"]+)/)?.[1] ?? item.name });
    } catch (error) { output.push({ ...record, gap: error.message }); }
  }
  await writeFile(`${directory}/examples.json`, JSON.stringify({ checkedAt: pages.checkedAt, examples: output }, null, 2) + "\n");
  console.log(`${slug}: ${output.filter(record => !record.gap).length}/${output.length} official demo graphs extracted`);
  console.log(JSON.stringify(output.filter(record => record.gap || record.unresolved?.length).map(({name,gap,unresolved})=>({name,gap,unresolved}))));
  console.log("Packages:", [...new Set(output.flatMap(record => record.packages ?? []))].join(", "));
}
