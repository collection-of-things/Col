import { posix } from "node:path";
import { parse } from "@babel/parser";

const packageName = name => name.startsWith("@") ? name.split("/").slice(0, 2).join("/") : name.split("/")[0];
const visit = (node, fn) => {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) { node.forEach(item => visit(item, fn)); return; }
  fn(node);
  for (const [key, value] of Object.entries(node)) if (!["loc", "comments", "tokens"].includes(key)) visit(value, fn);
};

export function resolveMotionImport(slug, files, importer, name) {
  const aliases = slug === "nikala-ui"
    ? { "@/components/ui": "packages/core/src/registry/components/ui", "@/providers": "packages/core/src/registry/providers", "@/hooks": "packages/hooks/src", "@nikala-ui/hooks": "packages/hooks/src/index.ts", "@/lib": "packages/core/src/lib" }
    : slug === "magicui-solid" ? { "@": "src", "~": "src" } : { "@": "components/tailwind/src" };
  const alias = Object.keys(aliases).sort((a, b) => b.length - a.length).find(key => name === key || name.startsWith(key + "/"));
  const path = alias ? aliases[alias] + name.slice(alias.length) : name.startsWith(".") ? posix.normalize(posix.join(posix.dirname(importer), name)) : undefined;
  if (!path) return;
  return [path, ...[".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"].map(extension => path + extension), path.replace(/\.js$/, ".tsx"), path.replace(/\.js$/, ".ts"), path.replace("packages/core/src/lib/", "apps/web/src/lib/") + ".ts", path.replace("packages/hooks/src/", "apps/web/src/hooks/") + ".ts"].find(candidate => files[candidate]);
}

/** Follow the component itself, excluding documentation and demo-only dependencies. */
export function motionComponentDependencies(slug, example, upstream, examples) {
  const dependencies = new Set();
  const registryDependencies = new Set();
  const paths = new Set();
  const unresolved = new Set();
  const components = new Map(examples.map(item => [item.componentSource, item.slug]));
  function inspect(path) {
    if (paths.has(path)) return;
    paths.add(path);
    const source = upstream.files[path];
    if (!source) { unresolved.add(path); return; }
    if (path !== example.componentSource && slug === "nikala-ui" && components.has(path)) registryDependencies.add(components.get(path));
    const ast = parse(source.content, { sourceType: "module", plugins: ["typescript", "jsx"] });
    const imports = new Set();
    visit(ast, node => {
      if (["ImportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration"].includes(node.type) && node.source) imports.add(node.source.value);
      if (node.type === "ImportExpression" && node.source.type === "StringLiteral") imports.add(node.source.value);
      if (node.type === "CallExpression" && node.callee.type === "Import" && node.arguments[0]?.type === "StringLiteral") imports.add(node.arguments[0].value);
      if (["JSXElement", "JSXFragment"].includes(node.type)) dependencies.add("solid-js");
    });
    for (const name of imports) {
      const local = resolveMotionImport(slug, upstream.files, path, name);
      if (local) inspect(local);
      else if (/^(?:\.|@\/|~\/|@nikala-ui\/)/.test(name)) unresolved.add(`${path}: ${name}`);
      else dependencies.add(packageName(name));
    }
  }
  inspect(example.componentSource);
  if (slug === "magicui-solid") {
    const source = upstream.files["registry.ts"];
    const ast = parse(source.content, { sourceType: "module", plugins: ["typescript"] });
    const property = (object, key) => object.properties.find(item => item.type === "ObjectProperty" && (item.key.name ?? item.key.value) === key)?.value;
    visit(ast, node => {
      if (node.type !== "CallExpression" || node.callee.name !== "uiItem" || node.arguments[0]?.type !== "ObjectExpression") return;
      const item = node.arguments[0];
      if (property(item, "name")?.value !== example.slug) return;
      // The pinned uiItem helper adds this dependency to every registry UI item.
      if (!source.content.includes("Array.from(new Set([dep('theme'), ...registryDependencies]))")) throw new Error("Magic registry helper changed; verify its implicit theme dependency");
      registryDependencies.add("@magicui-solid/theme");
      const list = property(item, "registryDependencies");
      for (const dependency of list?.elements ?? []) {
        if (dependency.type === "StringLiteral") registryDependencies.add(dependency.value);
        else if (dependency.type === "CallExpression" && dependency.callee.name === "dep" && dependency.arguments[0]?.type === "StringLiteral") registryDependencies.add(`@magicui-solid/${dependency.arguments[0].value}`);
        else unresolved.add(`registry.ts: registry dependency expression for ${example.slug}`);
      }
      for (const dependency of property(item, "dependencies")?.elements ?? []) {
        if (dependency.type === "StringLiteral") dependencies.add(dependency.value);
        else unresolved.add(`registry.ts: package dependency expression for ${example.slug}`);
      }
      paths.add("registry.ts");
    });
  }
  if (slug === "mystic-ui") {
    const path = `packages/registry/tailwind/${example.slug}.json`;
    const registry = upstream.files[path];
    if (registry) {
      const record = JSON.parse(registry.content);
      for (const name of record.dependencies ?? []) dependencies.add(name);
      for (const name of record.registryDependencies ?? []) registryDependencies.add(name);
      paths.add(path);
    }
  }
  return {
    dependencies: [...dependencies].sort(),
    registryDependencies: [...registryDependencies].sort(),
    sources: [...paths].sort().map(path => ({ path, url: upstream.files[path]?.url, integrity: upstream.files[path]?.integrity })),
    unresolved: [...unresolved].sort(),
  };
}
