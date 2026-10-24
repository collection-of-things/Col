/** Compile the upstream stylesheet closure without dropping package imports or plugins.
 * Package CSS resolves against its recorded version and exports; build-time plugins
 * run only from an isolated npm install with lifecycle scripts disabled.
 */
import { compile } from "tailwindcss";
import { Scanner } from "@tailwindcss/oxide";
import { loadModule } from "@tailwindcss/node";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { parse } from "postcss";

const run = promisify(execFile);
const hash = (text) => createHash("sha256").update(text).digest("hex");
const exactVersion = (value) => {
  const version = value?.replace(/^[~^]/, "");
  return /^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/.test(version ?? "") ? version : undefined;
};
const packageName = (id) => id.startsWith("@") ? id.split("/").slice(0, 2).join("/") : id.split("/")[0];

function cssExport(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(cssExport).find(Boolean);
  if (value && typeof value === "object") {
    for (const condition of ["style", "default", "import", "require"]) {
      const selected = cssExport(value[condition]);
      if (selected) return selected;
    }
  }
}

/** Returns compiled CSS and hashes of every fetched package CSS/manifest and plugin lockfile. */
export async function compileUpstreamCss(project, { source, files, cssImports, cache, reader, previousStyleSources = [] }) {
  if (!reader) throw new Error("A verified source reader is required to compile upstream CSS");
  const prefix = `https://raw.githubusercontent.com/${project.repo}/${project.revision}/`;
  const sourceFiles = new Map();
  const downloads = new Map();
  const manifests = new Map();
  const licenses = {};
  const styleCache = new Map();
  const pluginPins = {};
  const externalStylesheets = new Set();
  const buildDirectory = resolve(cache, `css-${hash(project.repo + project.revision).slice(0, 20)}`);
  await mkdir(buildDirectory, { recursive: true });

  async function download(url) {
    if (!downloads.has(url)) downloads.set(url, (async () => {
      const content = await reader.read(url);
      sourceFiles.set(url, { url, sha256: hash(content) });
      return content;
    })());
    return downloads.get(url);
  }

  function npmLocation(url) {
    const match = url.match(/^https:\/\/cdn\.jsdelivr\.net\/npm\/(@[^/]+\/[^@/]+|[^@/]+)@([^/]+)\//);
    return match ? { name: match[1], version: match[2] } : undefined;
  }

  async function manifest(name, version) {
    const key = `${name}@${version}`;
    if (!manifests.has(key)) manifests.set(key, download(`https://cdn.jsdelivr.net/npm/${key}/package.json`).then(JSON.parse));
    return manifests.get(key);
  }

  async function preserveLicense(name, version, pkg) {
    const key = `${name}@${version}`;
    const paths = ["LICENSE", "LICENSE.md", "license.md", "LICENSE.txt", "LICENSE-MIT", "license"];
    paths.sort((a, b) => Number(reader.hasPin(`https://cdn.jsdelivr.net/npm/${key}/${b}`)) - Number(reader.hasPin(`https://cdn.jsdelivr.net/npm/${key}/${a}`)));
    for (const path of paths) {
      const url = `https://cdn.jsdelivr.net/npm/${key}/${path}`;
      if (!reader.refresh && !reader.hasPin(url)) continue;
      try {
        const text = await download(url);
        if (!text.trim()) continue;
        licenses[key] = { url, text, sha256: hash(text), declaredLicense: pkg.license };
        return;
      } catch (error) {
        if (!/HTTP 404:/.test(error.message)) throw error;
      }
    }
    throw new Error(`Required upstream CSS license notice not found: ${key} (${pkg.license ?? "unknown license"})`);
  }

  async function versionFor(name, base) {
    const parent = npmLocation(base);
    if (parent?.name === name) return parent.version;
    const upstream = parent && await manifest(parent.name, parent.version);
    const version = exactVersion(project.dependencies[name])
      ?? exactVersion(upstream?.dependencies?.[name])
      ?? exactVersion(upstream?.peerDependencies?.[name]);
    if (!version) throw new Error(`No exact upstream CSS dependency pin: ${name}`);
    return version;
  }

  async function stylesheetUrl(id, base) {
    if (id.startsWith("col-source:")) return prefix + id.slice("col-source:".length);
    if (id.startsWith(".")) return new URL(id, base).href;
    if (id.startsWith(prefix) || id.startsWith("https://cdn.jsdelivr.net/npm/")) return id;
    if (/^(?:https?:|\/)/.test(id)) throw new Error(`Unrecorded upstream stylesheet origin: ${id}`);
    const name = packageName(id);
    const version = await versionFor(name, base);
    const pkg = await manifest(name, version);
    const suffix = id.slice(name.length);
    const key = suffix ? `.${suffix}` : ".";
    let path;
    if (pkg.exports) {
      path = cssExport(typeof pkg.exports === "string" ? (key === "." ? pkg.exports : undefined) : pkg.exports[key]);
      if (!path && typeof pkg.exports === "object") {
        for (const [pattern, target] of Object.entries(pkg.exports)) {
          if (!pattern.includes("*")) continue;
          const [start, end] = pattern.split("*");
          if (key.startsWith(start) && key.endsWith(end)) {
            path = cssExport(target)?.replace("*", key.slice(start.length, end ? -end.length : undefined));
            break;
          }
        }
      }
      if (!path && key === ".") path = cssExport(pkg.exports);
    } else path = suffix.slice(1) || pkg.style || (pkg.main?.endsWith(".css") ? pkg.main : undefined);
    if (!path?.endsWith(".css")) throw new Error(`No official CSS export for ${id}@${version}`);
    return new URL(path, `https://cdn.jsdelivr.net/npm/${name}@${version}/`).href;
  }

  async function loadStylesheet(id, base) {
    const url = await stylesheetUrl(id, base);
    if (!styleCache.has(url)) styleCache.set(url, (async () => {
      const content = url.startsWith(prefix) ? await source(url.slice(prefix.length)) : await download(url);
      sourceFiles.set(url, { url, sha256: hash(content) });
      const stylesheet = { path: url, base: new URL(".", url).href, content };
      // Parse directives instead of scanning comments that may quote self imports.
      const directives = [];
      parse(content).walkAtRules(rule => {
        if (["plugin", "import", "reference"].includes(rule.name)) directives.push(rule);
      });
      for (const rule of directives) {
        const id = rule.params.match(/^(?:url\(\s*)?["']([^"']+)["']/)?.[1];
        if (!id) throw new Error(`Unsupported upstream CSS directive: @${rule.name} ${rule.params}`);
        // Keep upstream remote font imports intact. The browser's unchanged CSP
        // decides whether they load; callers must disclose these dependencies.
        if (rule.name !== "plugin" && /^https?:/.test(id)) { externalStylesheets.add(id); continue; }
        if (rule.name !== "plugin") { await loadStylesheet(id, stylesheet.base); continue; }
        if (id.startsWith(".")) {
          const parent = npmLocation(stylesheet.base);
          if (!parent) throw new Error(`Unbundled relative source CSS plugin: ${id}`);
          pluginPins[parent.name] = parent.version;
        } else pluginPins[packageName(id)] = await versionFor(packageName(id), stylesheet.base);
      }
      return stylesheet;
    })());
    return styleCache.get(url);
  }

  const paths = [...new Set([...project.cssPaths, ...cssImports])];
  if (!paths.length) return { css: "", sourceFiles: [], externalStylesheets: [], licenses: {} };
  for (const path of paths) await loadStylesheet(prefix + path, prefix);

  let requirePlugin;
  if (Object.keys(pluginPins).length) {
    const dependencyPins = { ...pluginPins, tailwindcss: await versionFor("tailwindcss", prefix) };
    const lockUrl = `npm-plugin-lock:${project.repo}@${project.revision}`;
    const committedLock = previousStyleSources.find(file => file.url === lockUrl)?.lockfile;
    let lock = committedLock ?? await readFile(resolve(buildDirectory, "package-lock.json"), "utf8").catch(() => undefined);
    if (lock) reader.verify(lockUrl, lock);
    else if (!reader.refresh) throw new Error(`Missing committed CSS plugin lockfile; rerun with --refresh-source-pins: ${project.repo}`);
    await writeFile(resolve(buildDirectory, "package.json"), JSON.stringify({ private: true, dependencies: dependencyPins }));
    if (lock) await writeFile(resolve(buildDirectory, "package-lock.json"), lock);
    const npmCli = process.env.npm_execpath?.endsWith("npm-cli.js")
      ? process.env.npm_execpath : resolve(dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
    // npm ci recreates the build-time plugin tree and verifies package tarball
    // integrity; cached executable plugin files are never trusted as-is.
    console.log("VERIFY CSS PLUGINS", project.repo, Object.keys(dependencyPins).join(", "));
    await run(process.execPath, [npmCli, lock ? "ci" : "install", "--ignore-scripts", "--legacy-peer-deps", "--no-audit", "--no-fund", "--prefer-offline", "--fetch-timeout=30000", "--fetch-retries=1"], { cwd: buildDirectory, maxBuffer: 2_000_000, timeout: 900_000, windowsHide: true });
    lock = await readFile(resolve(buildDirectory, "package-lock.json"), "utf8");
    reader.verify(lockUrl, lock);
    requirePlugin = createRequire(resolve(buildDirectory, "package.json"));
    sourceFiles.set("plugins", { url: lockUrl, sha256: hash(lock), dependencies: dependencyPins, lockfile: lock });
  }

  // Tailwind intentionally preserves HTTP @imports, so use an internal source ID
  // that our loader resolves to the immutable repository URL.
  const compiler = await compile(paths.map(path => `@import ${JSON.stringify("col-source:" + path)};`).join("\n"), {
    base: prefix,
    loadStylesheet,
    async loadModule(id, base) {
      if (!requirePlugin) throw new Error(`Required CSS plugin was not installed: ${id}`);
      if (id.startsWith(".")) {
        const url = new URL(id, base).href;
        const parent = npmLocation(url);
        if (!parent) throw new Error(`Unrecorded relative plugin source: ${url}`);
        const packageRoot = `https://cdn.jsdelivr.net/npm/${parent.name}@${parent.version}/`;
        const path = resolve(buildDirectory, "node_modules", parent.name, url.slice(packageRoot.length));
        return loadModule(path, buildDirectory, () => {});
      }
      return loadModule(id, buildDirectory, () => {}, async name => requirePlugin.resolve(name));
    },
  });
  const scanner = new Scanner({});
  const candidates = scanner.scanFiles([...files].map(([path, content]) => ({ content, extension: path.split(".").at(-1) })));
  for (const [name, version] of Object.entries(pluginPins)) await manifest(name, version);
  for (const [key, pending] of manifests) {
    const split = key.lastIndexOf("@");
    await preserveLicense(key.slice(0, split), key.slice(split + 1), await pending);
  }
  return { css: compiler.build(candidates), sourceFiles: [...sourceFiles.values()], externalStylesheets: [...externalStylesheets], licenses };
}
