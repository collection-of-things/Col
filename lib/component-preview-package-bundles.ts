import { parse } from "@babel/parser";
import packageBundles from "../data/component-previews/package-bundles.json" with { type: "json" };
import supplementalBundles from "../data/component-previews/package-bundles-supplemental.json" with { type: "json" };

type PackageBundle = {
  code: string;
  externals: readonly string[];
  exports: readonly string[];
  importMappings?: Readonly<Record<string, Readonly<Record<string, string>>>>;
};

const bundles: Readonly<Record<string, PackageBundle>> = { ...packageBundles, ...supplementalBundles };
const webAwesomePrefix = "@awesome.me/webawesome@3.14.0/dist/react/";

/** Replace only exact, audited package imports with their real npm bundle.
 * All packages continue to share the renderer's pinned React modules. */
export function transformPreviewPackageImports(code: string): string {
  const ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });
  const replacements: { start: number; end: number; text: string }[] = [];
  const used = new Map<string, string>();
  let prefix = "__colOfficialPackage";
  while (code.includes(prefix)) prefix += "_";

  for (const statement of ast.program.body) {
    if (statement.type !== "ImportDeclaration") continue;
    const specifier = statement.source.value;
    let key = specifier;
    let defaultExport = "default";
    const mapped = Object.entries(bundles).find(([, value]) => value.importMappings && Object.hasOwn(value.importMappings, specifier));
    if (mapped) key = mapped[0];
    if (specifier.startsWith(webAwesomePrefix) && specifier.endsWith("/index.js")) {
      const slug = specifier.slice(webAwesomePrefix.length, -"/index.js".length);
      key = "@awesome.me/webawesome@3.14.0";
      defaultExport = "Wa" + slug.split("-").map(part => part[0].toUpperCase() + part.slice(1)).join("");
    }
    const bundle = Object.hasOwn(bundles, key) ? bundles[key] : undefined;
    if (!bundle) continue;
    const identifier = used.get(key) ?? `${prefix}${used.size}`;
    used.set(key, identifier);
    const definitions = statement.specifiers.map(item => {
      if (item.type === "ImportNamespaceSpecifier") {
        const namespace = bundle.importMappings?.[specifier]?.["*"];
        if (namespace) {
          if (!bundle.exports.includes(namespace)) throw new Error(`Official preview package ${key} does not export ${namespace}.`);
          return `const ${item.local.name} = ${identifier}[${JSON.stringify(namespace)}];`;
        }
        if (bundle.importMappings?.[specifier]) throw new Error(`Official subpath preview ${specifier} requires its audited named exports.`);
        return `const ${item.local.name} = ${identifier};`;
      }
      const originalName = item.type === "ImportDefaultSpecifier" ? defaultExport : item.imported.type === "Identifier" ? item.imported.name : item.imported.value;
      const name = bundle.importMappings?.[specifier]?.[originalName] ?? originalName;
      if (!bundle.exports.includes(name)) throw new Error(`Official preview package ${key} does not export ${name}.`);
      return `const ${item.local.name} = ${identifier}[${JSON.stringify(name)}];`;
    }).join("\n");
    if (statement.start === null || statement.start === undefined || statement.end === null || statement.end === undefined) throw new Error("Preview package import has no source location.");
    replacements.push({ start: statement.start, end: statement.end, text: definitions });
  }
  if (!used.size) return code;

  const externals = [...new Set([...used.keys()].flatMap(key => [...bundles[key].externals]))].sort();
  if (externals.some(name => !/^react(?:-dom)?(?:\/|$)/.test(name))) throw new Error("Official preview bundles may only externalize the shared React runtime.");
  const imports = externals.map((name, index) => `import * as ${prefix}External${index} from ${JSON.stringify(name)};`).join("\n");
  const requireBody = externals.map((name, index) => `case ${JSON.stringify(name)}: return ${prefix}External${index};`).join("\n");
  const implementations = [...used].map(([key, identifier]) => `const ${identifier} = ((require) => {\n${bundles[key].code}\nreturn ColLibraryExports;\n})((specifier) => { switch (specifier) { ${requireBody} default: throw new Error("Unexpected official preview dependency: " + specifier); } });`).join("\n");
  let transformed = code;
  for (const replacement of replacements.reverse()) transformed = transformed.slice(0, replacement.start) + replacement.text + transformed.slice(replacement.end);
  return `${imports}\n${implementations}\n${transformed}`;
}
