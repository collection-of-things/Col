import { relative, resolve, isAbsolute, sep } from "node:path";
import { parse } from "@babel/parser";

/** Source snapshots and media metadata may name files only inside their declared root. */
export function containedPath(root, path) {
  const target = resolve(root, path);
  const child = relative(resolve(root), target);
  if (!child || child === ".." || child.startsWith(".." + sep) || isAbsolute(child)) {
    throw new Error(`Path escapes its intended root: ${path}`);
  }
  return target;
}

/** Keep verified media URLs as executable literals for Col's delivery-time relocation. */
export function dynamicAssetUrls(code, filename, urls) {
  if (!/\.[cm]?[jt]sx?$/.test(filename) || !urls.size) return code;
  const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  const edits = [];
  function walk(node, parent) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach(item => walk(item, parent)); return; }
    if (node.type === "StringLiteral" && urls.has(node.value)) {
      const existing = parent?.type === "CallExpression" && parent.callee.type === "MemberExpression" && parent.callee.object.name === "window" && parent.callee.property.name === "String";
      if (!existing) {
        const value = `window.String(${JSON.stringify(node.value)})`;
        edits.push({ start: node.start, end: node.end, value: parent?.type === "JSXAttribute" ? `{${value}}` : value });
      }
    }
    for (const [key, value] of Object.entries(node)) if (!["loc", "comments", "tokens"].includes(key)) walk(value, node);
  }
  walk(ast);
  for (const edit of edits.sort((a, b) => b.start - a.start)) code = code.slice(0, edit.start) + edit.value + code.slice(edit.end);
  return code;
}

export function motionAssetTransport(upstream) {
  return {
    adaptation: "Verified shared-image and video URL literals stay dynamic through window.String during compilation, preventing Solid/esbuild from folding URLs into static HTML templates. Col relocates those unchanged original URL literals at delivery; original JSX composition and styling remain intact.",
    assets: Object.entries(upstream.assets).filter(([,asset]) => asset.manifestFile || asset.resourceFile).map(([url,asset]) => ({url,integrity:asset.integrity,bytes:asset.bytes,...(asset.manifestFile?{manifestFile:asset.manifestFile}:{resourceFile:asset.resourceFile})})),
  };
}
