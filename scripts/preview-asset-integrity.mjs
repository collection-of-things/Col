import { createHash } from "node:crypto";

/** Accept only passive SVG artwork, including local fragment reuse. This is a
 * validator, not a sanitizer: the original bytes are either retained or rejected. */
export function verifyPassiveSvg(source) {
  if (!/^\s*<svg\s/.test(source) || /[&]|<!|<\?/.test(source)) throw new Error("SVG contains unsupported markup");
  const tags = new Set(["svg", "g", "path", "rect", "circle", "ellipse", "polygon", "polyline", "line", "defs", "clipPath", "use"]);
  const attributes = new Set(["xmlns", "xmlns:xlink", "width", "height", "viewBox", "fill", "d", "stroke", "stroke-width", "id", "xlink:href", "href", "x", "y", "clip-path", "transform", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "rx", "ry", "cx", "cy", "r", "fill-rule", "fill-opacity", "points"]);
  const stack = [];
  let end = 0;
  for (const match of source.matchAll(/<(\/?)([A-Za-z][\w:-]*)([^<>]*?)>/g)) {
    if (source.slice(end, match.index).trim()) throw new Error("SVG contains unsupported content");
    const [, closing, name, body] = match;
    if (!tags.has(name)) throw new Error(`Unsupported SVG element: ${name}`);
    if (closing) {
      if (body.trim() || stack.pop() !== name) throw new Error("Invalid SVG nesting");
    } else {
      if (!stack.length && (name !== "svg" || end > 0)) throw new Error("Invalid SVG root");
      const selfClosing = /\/\s*$/.test(body);
      const text = selfClosing ? body.replace(/\/\s*$/, "") : body;
      let position = 0;
      for (const attr of text.matchAll(/\s+([A-Za-z_:][\w:.-]*)=(?:"([^"]*)"|'([^']*)')/g)) {
        if (text.slice(position, attr.index).trim()) throw new Error("Invalid SVG attribute syntax");
        const key = attr[1], value = attr[2] ?? attr[3];
        if (!attributes.has(key)) throw new Error(`Unsupported SVG attribute: ${key}`);
        if (key === "href" || key === "xlink:href") {
          if (!/^#[\w.-]+$/.test(value)) throw new Error("SVG reference is not a local fragment");
        } else if (key === "clip-path") {
          if (!/^url\(#[\w.-]+\)$/.test(value)) throw new Error("SVG clip reference is not local");
        } else if (key === "xmlns" || key === "xmlns:xlink") {
          if (value !== (key === "xmlns" ? "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xlink")) throw new Error("Unexpected SVG namespace");
        } else if (!/^[\w\s.,#+%()\-]*$/.test(value) || /url\s*\(/i.test(value)) throw new Error("Unsupported SVG attribute value");
        position = attr.index + attr[0].length;
      }
      if (text.slice(position).trim()) throw new Error("Invalid SVG attribute syntax");
      if (!selfClosing) stack.push(name);
    }
    end = match.index + match[0].length;
  }
  if (!end || stack.length || source.slice(end).trim()) throw new Error("Invalid SVG document");
}

export function verifyPreviewAsset(asset) {
  const bytes = Buffer.from(asset.base64, "base64");
  if (bytes.length !== asset.bytes || createHash("sha256").update(bytes).digest("hex") !== asset.sha256) throw new Error(`Asset integrity mismatch: ${asset.url}`);
  if (asset.mediaType === "image/svg+xml") verifyPassiveSvg(bytes.toString("utf8"));
  else {
    const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    if (!(asset.mediaType === "image/png" && png || asset.mediaType === "image/jpeg" && jpeg)) throw new Error(`Invalid raster image: ${asset.url}`);
  }
  return asset;
}
