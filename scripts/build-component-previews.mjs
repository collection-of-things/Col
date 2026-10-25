/** Build reviewed upstream examples without rewriting their components.
 * Network access happens only here, never in response to an MCP argument.
 * Each downloaded file and emitted bundle is hashed in the committed manifest.
 * Pass repository names to rebuild selected projects. Adding reviewed source
 * URLs/revisions requires --refresh-source-pins; existing hashes stay enforced.
 */
import { build } from "esbuild";
import { compileUpstreamCss } from "./preview-upstream-css.mjs";
import { collectSourcePins, createVerifiedSourceReader } from "./preview-source-integrity.mjs";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { posix, resolve } from "node:path";
import { extraSourceDescriptors, extraSourceBlockers } from "./preview-sources-extra.mjs";
import { resolveReuiIconRegistry, reuiIconRegistryGap } from "./preview-reui-icons.mjs";

const root = resolve(import.meta.dirname, "..");
const cache = resolve(root, "artifacts/col-preview-expansion/cache");
await mkdir(cache, { recursive: true });
const hash = (text) => createHash("sha256").update(text).digest("hex");
const outputPath = resolve(root, "data/component-previews/extra.json");
const previous = JSON.parse(await readFile(outputPath, "utf8"));
const reuseCss = process.argv.includes("--reuse-upstream-css");
const selected = process.argv.slice(2).filter(argument => !["--refresh-source-pins", "--reuse-upstream-css"].includes(argument));
const reader = createVerifiedSourceReader({ cache, pins: collectSourcePins(previous), refresh: process.argv.includes("--refresh-source-pins") });
const download = reader.read;
const output = selected.length || reuseCss ? structuredClone(previous) : { entries: {}, styles: {}, unavailable: {}, licenses: {} };
const groups = Map.groupBy(extraSourceDescriptors, (entry) => entry.repo);
for (const [repo, descriptors] of groups) {
  if (selected.length && !selected.includes(repo)) continue;
  const project = descriptors[0];
  for (const { id } of descriptors) { delete output.entries[id]; delete output.unavailable[id]; }
  const prefix = `https://raw.githubusercontent.com/${repo}/${project.revision}/`;
  const files = new Map();
  const cssImports = new Set();
  const source = async (path) => {
    if (path.startsWith("../") || path.startsWith("/")) throw new Error("Source path escapes its repository");
    const content = await download(prefix + path);
    files.set(path, content);
    return content;
  };
  const existingPath = async (path) => {
    const candidates = [path, path + ".tsx", path + ".ts", path + ".jsx", path + ".js", path + "/index.tsx", path + "/index.ts"];
    candidates.sort((a, b) => Number(reader.hasPin(prefix + b)) - Number(reader.hasPin(prefix + a)));
    for (const candidate of candidates) {
      if (!reader.refresh && !reader.hasPin(prefix + candidate)) continue;
      try { await source(candidate); return candidate; } catch (error) { if (!String(error).includes("HTTP 404")) throw error; }
    }
    throw new Error(`No upstream module: ${path}`);
  };
  const license = await source(project.licensePath);
  if (!/Permission is hereby granted|MIT License/i.test(license)) throw new Error(`License review required: ${repo}`);
  output.licenses[repo] = { url: prefix + project.licensePath, text: license };
  async function buildDescriptor(descriptor) {
    const used = new Set();
    const themeProvider = project.dependencies["next-themes"];
    const demoImport = `import { ${descriptor.exportName ?? "default"} as ColOfficialDemo } from ${JSON.stringify(descriptor.entryPath)};`;
    // The upstream toast demo relies on the app layout to mount its own Toaster.
    const toasterImport = descriptor.id === "hextaui/Toast" ? 'import { Toaster as ColToaster } from "@/components/ui/toast";' : "";
    const demo = toasterImport ? "<><ColOfficialDemo /><ColToaster /></>" : "<ColOfficialDemo />";
    const entry = themeProvider
      ? `${demoImport} ${toasterImport} import { ThemeProvider } from "next-themes"; export default function ColThemedDemo() { return <ThemeProvider forcedTheme={PREVIEW_THEME} defaultTheme={PREVIEW_THEME} attribute="class" enableSystem={false}>${demo}</ThemeProvider>; }`
      : `${demoImport} export default ColOfficialDemo;`;
    try {
      const result = await build({
        stdin: { contents: entry, resolveDir: root, loader: "tsx" },
        bundle: true, write: false, format: "esm", platform: "browser", jsx: "automatic", target: "es2022", minify: true, legalComments: "inline", logLevel: "silent", metafile: true,
        plugins: [{ name: "official-source", setup(builder) {
          builder.onResolve({ filter: /.*/ }, async ({ path, importer }) => {
            let local = path === descriptor.entryPath ? path : undefined;
            if (path.startsWith(".")) local = posix.normalize(posix.join(posix.dirname(importer), path));
            const alias = Object.keys(project.aliases).sort((a, b) => b.length - a.length).find((key) => path.startsWith(key));
            if (alias) local = project.aliases[alias] + path.slice(alias.length);
            if (local) return { path: await existingPath(local), namespace: "official" };
            const name = path.startsWith("@") ? path.split("/").slice(0, 2).join("/") : path.split("/")[0];
            if (["react", "react-dom"].includes(name)) return { path, external: true };
            if (path === "process" && project.dependencies.next) return { path: "https://cdn.jsdelivr.net/npm/process@0.11.10/browser.js", namespace: "browser-plumbing" };
            if (["next", "server-only"].includes(name) || /^(node:|https?:)/.test(path)) throw new Error(`App/server dependency cannot be substituted: ${path}`);
            const version = project.dependencies[name];
            if (!version || !/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(version)) throw new Error(`No exact upstream dependency pin: ${path}`);
            return { path: name + "@" + version + path.slice(name.length), external: true };
          });
          builder.onLoad({ filter: /.*/, namespace: "official" }, async ({ path }) => {
            const contents = await source(path);
            used.add(path);
            if (path.endsWith(".css")) { cssImports.add(path); return { contents: "", loader: "js" }; }
            const resolvedContents = repo === "keenthemes/reui" && path === "registry/icons/create-icon-loader.tsx" ? resolveReuiIconRegistry(contents) : contents;
            return { contents: resolvedContents, loader: path.endsWith(".json") ? "json" : "tsx" };
          });
          builder.onLoad({ filter: /.*/, namespace: "browser-plumbing" }, async ({ path }) => {
            const contents = await download(path);
            files.set(path, contents); used.add(path);
            const licenseUrl = path.replace(/browser\.js$/, "LICENSE");
            const licenseText = await download(licenseUrl);
            files.set(licenseUrl, licenseText); used.add(licenseUrl);
            output.licenses["process@0.11.10"] = { url: licenseUrl, text: licenseText };
            return { contents, loader: "js" };
          });
        } }],
      });
      const code = result.outputFiles[0].text;
      if (result.warnings.some(warning => warning.id === "empty-glob")) throw new Error("An upstream dynamic module registry could not be resolved; explicit reviewed bundler support is required.");
      if (!code.trim() || !used.has(descriptor.entryPath) || !Object.values(result.metafile.outputs).some(entry => entry.exports.includes("default"))) {
        throw new Error(`Official demo did not emit a runtime default export: ${descriptor.entryPath}`);
      }
      output.entries[descriptor.id] = {
        code, styleKey: repo, package: repo, version: project.revision.slice(0, 12), exportName: `${descriptor.exportName ?? "default"} (official source)`,
        source: { url: `https://github.com/${repo}/blob/${project.revision}/${descriptor.entryPath}`, revision: project.revision, integrity: "sha256:" + hash(code), files: [...used].sort().map((path) => ({ url: path.startsWith("https:") ? path : prefix + path, sha256: hash(files.get(path)) })) },
        gaps: [...descriptor.gaps, ...(repo === "keenthemes/reui" ? [reuiIconRegistryGap] : []), ...(themeProvider ? [`Uses the actual next-themes@${themeProvider} ThemeProvider with the requested color scheme forced. App-specific theme names and providers are not reproduced.`] : [])],
      };
      console.log("BUILT", descriptor.id);
    } catch (error) {
      const message = error.errors?.map((entry) => entry.text).join("; ") ?? error.message;
      output.unavailable[descriptor.id] = message;
      console.log("UNAVAILABLE", descriptor.id, message.slice(0, 200));
    }
  }
  const pending = [...descriptors];
  await Promise.all(Array.from({ length: 6 }, async () => { while (pending.length) await buildDescriptor(pending.shift()); }));
  // Wrapper-only changes do not alter upstream utility classes. This explicit
  // mode requires the exact previously reviewed source closure and CSS bytes.
  if (reuseCss) {
    for (const { id } of descriptors) {
      const before = previous.entries[id];
      const after = output.entries[id];
      if (Boolean(before) !== Boolean(after) || (before && JSON.stringify(before.source.files) !== JSON.stringify(after.source.files))) {
        throw new Error(`Cannot reuse CSS after an upstream source/coverage change: ${id}`);
      }
      if (after) after.gaps.push(...before.gaps.filter(gap => gap.startsWith("The upstream theme imports external stylesheets:")));
    }
    if (previous.styleIntegrities[repo] !== "sha256:" + hash(previous.styles[repo])) throw new Error(`Compiled CSS integrity mismatch: ${repo}`);
    reader.assertValid();
    continue;
  }
  try {
    const compiled = await compileUpstreamCss(project, { source, files, cssImports, root, cache, reader, previousStyleSources: previous.styleSources?.[repo] ?? [] });
    output.styles[repo] = compiled.css;
    output.styleIntegrities ??= {};
    output.styleIntegrities[repo] = "sha256:" + hash(compiled.css);
    output.styleSources ??= {};
    output.styleSources[repo] = compiled.sourceFiles;
    Object.assign(output.licenses, compiled.licenses);
    if (compiled.externalStylesheets.length) {
      for (const { id } of descriptors) if (output.entries[id]) output.entries[id].gaps = [
        ...output.entries[id].gaps,
        `The upstream theme imports external stylesheets: ${compiled.externalStylesheets.join(", ")}. These remain subject to the client's unchanged CSP; blocked fonts/styles cannot be reproduced and are reported as preview errors.`,
      ];
    }
  } catch (error) {
    if (/integrity mismatch|Unreviewed source URL|Missing committed CSS plugin lockfile/.test(error.message)) throw error;
    for (const descriptor of descriptors) if (output.entries[descriptor.id]) {
      delete output.entries[descriptor.id];
      output.unavailable[descriptor.id] = `Required upstream CSS could not be compiled: ${error.message}`;
    }
    console.log("CSS UNAVAILABLE", repo, error.message);
  }
  reader.assertValid();
}
output.libraryBlockers = extraSourceBlockers;
output.sourcePins = reader.pins;
await mkdir(resolve(root, "data/component-previews"), { recursive: true });
await writeFile(resolve(root, "data/component-previews/extra.json"), JSON.stringify(output));
console.log("TOTAL", Object.keys(output.entries).length, "available", Object.keys(output.unavailable).length, "unavailable");
