/** Capture the published, pinned Quoin API declarations; never infer props from React. */
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve, relative } from "node:path";
import ts from "typescript";
import { quoinComponents, QUOIN_VERSION, SOLID_VERSION, QUOIN_VERIFIED_AT } from "../data/quoin/catalog.ts";

const root = resolve(import.meta.dirname, "..");
const packageRoot = resolve(root, "node_modules/quoin-ui");
const manifest = JSON.parse(await readFile(resolve(packageRoot, "package.json"), "utf8"));
if (manifest.version !== QUOIN_VERSION || Object.values(manifest.peerDependencies).some(version => version !== SOLID_VERSION)) {
  throw new Error("Install the recorded Quoin/Solid versions before capturing documentation.");
}
const publicSubpaths = Object.keys(manifest.exports).filter(key => ![".", "./internals", "./package.json"].includes(key)).sort();
if (JSON.stringify(publicSubpaths) !== JSON.stringify(quoinComponents.map(({ subpath }) => `./${subpath}`).sort())) {
  throw new Error("Review the Quoin component inventory before capturing a changed export map.");
}
const fileUrl = file => `https://cdn.jsdelivr.net/npm/quoin-ui@${QUOIN_VERSION}/${relative(packageRoot, file).replaceAll("\\", "/")}`;
const sha256 = content => createHash("sha256").update(content).digest("hex");
const license = await readFile(resolve(packageRoot, "LICENSE"), "utf8");
const documentation = {};

for (const { name, subpath } of quoinComponents) {
  const entry = resolve(packageRoot, manifest.exports[`./${subpath}`].types);
  const declarations = new Map();
  // Follow public re-exports only. Internal type imports remain links in the original declarations.
  async function capture(file) {
    if (declarations.has(file)) return;
    const content = await readFile(file, "utf8");
    declarations.set(file, content);
    const parsed = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
    for (const statement of parsed.statements) {
      if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const specifier = statement.moduleSpecifier.text;
      if (!specifier.startsWith(".")) continue;
      const target = resolve(dirname(file), specifier.replace(/\.js$/, ".d.ts"));
      if (!target.startsWith(packageRoot + "/") && !target.startsWith(packageRoot + "\\")) throw new Error("Declaration escaped Quoin package");
      await capture(target);
    }
  }
  await capture(entry);
  const ordered = [...declarations].sort(([a], [b]) => {
    const priority = file => file === entry ? 0 : /index\.parts\.d\.ts$/.test(file) ? 1 : /[\\/]root[\\/]|[\\/]create-/.test(file) ? 2 : 3;
    return priority(a) - priority(b) || a.localeCompare(b);
  });
  const sources = ordered.map(([file, content]) => ({ url: fileUrl(file), integrity: `sha256:${sha256(content)}` }));
  let content = `Published API for quoin-ui/${subpath} at ${QUOIN_VERSION}. Imports in these declarations are relative to the linked original files.\n\n`;
  const omitted = [];
  for (const [file, declaration] of ordered) {
    const section = `Source: ${fileUrl(file)}\n\n\`\`\`ts\n${declaration.replace(/\/\/# sourceMappingURL=.*\n?$/, "").trim()}\n\`\`\`\n\n`;
    if (content.length + section.length > 24_000) { omitted.push(fileUrl(file)); continue; }
    content += section;
  }
  if (omitted.length) content += `Additional public declarations (not inlined to keep this lookup bounded):\n${omitted.map(url => `- ${url}`).join("\n")}\n`;
  content += `\n${license.trim()}`;
  documentation[name] = {
    title: `${name}: published API declarations`,
    componentId: `quoin-ui/${name}`,
    url: fileUrl(entry),
    fetchedAt: QUOIN_VERIFIED_AT,
    sourceRevision: `quoin-ui@${QUOIN_VERSION}`,
    content,
    sources,
  };
}

await writeFile(resolve(root, "data/quoin/documentation.json"), JSON.stringify(documentation, null, 2) + "\n");
const readme = {
  title: "Quoin: published setup and composition guide",
  url: fileUrl(resolve(packageRoot, "README.md")),
  fetchedAt: QUOIN_VERIFIED_AT,
  sourceRevision: `quoin-ui@${QUOIN_VERSION}`,
  content: `${await readFile(resolve(packageRoot, "README.md"), "utf8")}\n\n${license}`,
  licenseNotice: license.trim(),
};
await writeFile(resolve(root, "data/quoin/readme.json"), JSON.stringify(readme, null, 2) + "\n");
console.log(`Captured ${Object.keys(documentation).length} Quoin component APIs; largest snapshot ${Math.max(...Object.values(documentation).map(snapshot => snapshot.content.length))} characters.`);
