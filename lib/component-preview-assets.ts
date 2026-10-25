import { parse } from "@babel/parser";
import assetSnapshot from "../data/component-previews/assets.json" with { type: "json" };

type Asset = {
  url: string; downloadUrl: string; resolvedUrl: string; sha256: string;
  mediaType: string; bytes: number; base64: string;
  attribution: { name: string; license: string; url: string };
};
type ComponentAssets = { source: string; revision: string; assets: string[]; templates?: { source: string; assets: string[] }[] };
const assets: Readonly<Record<string, Asset>> = assetSnapshot.assets;
const components: Readonly<Record<string, ComponentAssets>> = assetSnapshot.components;

/** Expose compact provenance separately from the original bytes in the preview. */
export function componentPreviewAssets(id: string) {
  const component = Object.hasOwn(components, id) ? components[id] : undefined;
  return component?.assets.map(url => {
    const { base64: _base64, ...provenance } = assets[url];
    return provenance;
  }) ?? [];
}

/** Relocate exact upstream image literals to pinned original bytes. No image is
 * generated, decoded/re-encoded, or fetched by the client. Unlisted URLs remain
 * untouched and subject to the existing host CSP and visible error reporting. */
export function transformPreviewAssets(id: string, code: string): string {
  const component = Object.hasOwn(components, id) ? components[id] : undefined;
  if (!component) return code;
  const ast = parse(code, { sourceType: "module", plugins: ["jsx", "typescript"] });
  const replacements: { start: number; end: number; value: string }[] = [];
  function visit(value: unknown) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if ("type" in value && value.type === "TemplateLiteral" && "start" in value && typeof value.start === "number" && "end" in value && typeof value.end === "number") {
      const original = code.slice(value.start, value.end);
      const template = component?.templates?.find(item => item.source === original);
      if (template) {
        const mapping = Object.fromEntries(template.assets.map(url => [url, `data:${assets[url].mediaType};base64,${assets[url].base64}`]));
        replacements.push({ start: value.start, end: value.end, value: `((url) => (${JSON.stringify(mapping)}[url] ?? url))(${original})` });
        return;
      }
    }
    if ("type" in value && value.type === "StringLiteral" && "value" in value && typeof value.value === "string" && component?.assets.includes(value.value)) {
      if (!("start" in value && typeof value.start === "number" && "end" in value && typeof value.end === "number")) throw new Error("Preview asset literal has no source location.");
      const asset = assets[value.value];
      replacements.push({ start: value.start, end: value.end, value: JSON.stringify(`data:${asset.mediaType};base64,${asset.base64}`) });
      return;
    }
    Object.values(value).forEach(visit);
  }
  visit(ast.program);
  let result = code;
  for (const replacement of replacements.sort((a, b) => b.start - a.start)) result = result.slice(0, replacement.start) + replacement.value + result.slice(replacement.end);
  return result;
}
