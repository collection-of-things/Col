import { createHash } from "node:crypto";

/** Accept only passive SVG artwork, including local fragment reuse. This is a
 * validator, not a sanitizer: the original bytes are either retained or rejected. */
export function verifyPassiveSvg(source) {
  if (!/^\s*<svg\s/.test(source) || /[&]|<!|<\?/.test(source)) throw new Error("SVG contains unsupported markup");
  const tags = new Set(["svg", "g", "path", "rect", "circle", "ellipse", "polygon", "polyline", "line", "defs", "clipPath", "use", "title"]);
  const attributes = new Set(["xmlns", "xmlns:xlink", "width", "height", "viewBox", "fill", "d", "stroke", "stroke-width", "id", "xlink:href", "href", "x", "y", "clip-path", "transform", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "rx", "ry", "cx", "cy", "r", "fill-rule", "fill-opacity", "points", "role"]);
  const stack = [];
  let end = 0;
  for (const match of source.matchAll(/<(\/?)([A-Za-z][\w:-]*)([^<>]*?)>/g)) {
    if (source.slice(end, match.index).trim() && stack.at(-1) !== "title") throw new Error("SVG contains unsupported content");
    const [, closing, name, body] = match;
    if (!tags.has(name)) throw new Error(`Unsupported SVG element: ${name}`);
    if (closing) {
      if (body.trim() || stack.pop() !== name) throw new Error("Invalid SVG nesting");
    } else {
      if (stack.at(-1) === "title") throw new Error("SVG title must contain only text");
      if (!stack.length && (name !== "svg" || end > 0)) throw new Error("Invalid SVG root");
      const selfClosing = /\/\s*$/.test(body);
      const text = selfClosing ? body.replace(/\/\s*$/, "") : body;
      let position = 0;
      for (const attr of text.matchAll(/\s+([A-Za-z_:][\w:.-]*)=(?:"([^"]*)"|'([^']*)')/g)) {
        if (text.slice(position, attr.index).trim()) throw new Error("Invalid SVG attribute syntax");
        const key = attr[1], value = attr[2] ?? attr[3];
        if (!attributes.has(key)) throw new Error(`Unsupported SVG attribute: ${key}`);
        if (key === "role") {
          if (value !== "img") throw new Error("Unsupported SVG role");
        } else if (key === "href" || key === "xlink:href") {
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
  if (bytes.length > 2_000_000) throw new Error(`Asset exceeds 2 MB: ${asset.url}`);
  if (bytes.length !== asset.bytes || createHash("sha256").update(bytes).digest("hex") !== asset.sha256) throw new Error(`Asset integrity mismatch: ${asset.url}`);
  if (asset.mediaType === "image/svg+xml") verifyPassiveSvg(bytes.toString("utf8"));
  else if (asset.mediaType === "video/webm") verifyWebmContainer(bytes);
  else if (asset.mediaType === "video/mp4") verifyMp4Container(bytes);
  else if (asset.mediaType === "audio/mpeg") verifyMp3Frames(bytes);
  else if (asset.mediaType === "image/webp") verifyWebpContainer(bytes);
  else {
    const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const gif = bytes.length >= 14 && (bytes.subarray(0, 6).equals(Buffer.from("GIF87a")) || bytes.subarray(0, 6).equals(Buffer.from("GIF89a")))
      && bytes.readUInt16LE(6) > 0 && bytes.readUInt16LE(8) > 0 && bytes[bytes.length - 1] === 0x3b;
    if (!(asset.mediaType === "image/png" && png || asset.mediaType === "image/jpeg" && jpeg || asset.mediaType === "image/gif" && gif)) throw new Error(`Invalid raster image: ${asset.url}`);
  }
  return asset;
}

/** Validate the bounded RIFF container and image chunks, without re-encoding. */
export function verifyWebpContainer(bytes) {
  if (bytes.length < 20 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP" || bytes.readUInt32LE(4) !== bytes.length - 8) throw new Error("Invalid WebP container");
  let offset = 12, image = false;
  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) throw new Error("Invalid WebP chunk");
    const type = bytes.toString("ascii", offset, offset + 4), size = bytes.readUInt32LE(offset + 4);
    if (!size || offset + 8 + size > bytes.length) throw new Error("Invalid WebP chunk length");
    if (type === "VP8 " || type === "VP8L" || type === "ANMF") image = true;
    offset += 8 + size + size % 2;
  }
  if (!image || offset !== bytes.length) throw new Error("Invalid WebP image chunks");
}

/** Validate top-level ISO BMFF boxes and required MP4 media metadata. */
export function verifyMp4Container(bytes) {
  let offset = 0;
  const boxes = new Set();
  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) throw new Error("Invalid MP4 box");
    const size = bytes.readUInt32BE(offset), type = bytes.toString("ascii", offset + 4, offset + 8);
    if (size < 8 || offset + size > bytes.length) throw new Error("Invalid MP4 box length");
    if (!offset && (type !== "ftyp" || size < 16 || !["isom", "iso2", "mp41", "mp42"].includes(bytes.toString("ascii", 8, 12)))) throw new Error("Invalid MP4 file type");
    boxes.add(type);
    offset += size;
  }
  if (!boxes.has("moov") || !boxes.has("mdat")) throw new Error("Invalid MP4 media boxes");
}

/** Require two consecutive MPEG Layer III frames after optional ID3 metadata. */
export function verifyMp3Frames(bytes) {
  let offset = 0;
  if (bytes.toString("ascii", 0, 3) === "ID3") {
    if (bytes.length < 10 || ![3, 4].includes(bytes[3]) || bytes.subarray(6, 10).some(value => value & 0x80)) throw new Error("Invalid MP3 ID3 header");
    offset = 10 + bytes.subarray(6, 10).reduce((size, value) => size * 128 + value, 0) + (bytes[3] === 4 && bytes[5] & 0x10 ? 10 : 0);
  }
  for (let frame = 0; frame < 2; frame++) {
    if (offset + 4 > bytes.length || bytes[offset] !== 0xff || (bytes[offset + 1] & 0xe0) !== 0xe0) throw new Error("Invalid MP3 frame sync");
    const version = bytes[offset + 1] >> 3 & 3, layer = bytes[offset + 1] >> 1 & 3;
    const bitrateIndex = bytes[offset + 2] >> 4, sampleIndex = bytes[offset + 2] >> 2 & 3;
    if (version === 1 || layer !== 1 || !bitrateIndex || bitrateIndex === 15 || sampleIndex === 3) throw new Error("Invalid MP3 frame header");
    const rates = version === 3 ? [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320] : [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160];
    const sampleRate = [44100,48000,32000][sampleIndex] / (version === 3 ? 1 : version === 2 ? 2 : 4);
    offset += Math.floor((version === 3 ? 144 : 72) * rates[bitrateIndex] * 1000 / sampleRate) + (bytes[offset + 2] >> 1 & 1);
    if (offset > bytes.length) throw new Error("Invalid MP3 frame length");
  }
}

/** Check the EBML header and WebM doctype before trusting the recorded media type.
 * This does not transcode or modify the original video bytes. */
export function verifyWebmContainer(bytes) {
  function integer(offset, id = false) {
    const first = bytes[offset];
    if (!first) throw new Error("Invalid WebM EBML integer");
    let width = 1, marker = 0x80;
    while (!(first & marker)) { width++; marker >>= 1; }
    if (width > (id ? 4 : 8) || offset + width > bytes.length) throw new Error("Invalid WebM EBML integer");
    let value = id ? first : first & (marker - 1);
    for (let index = 1; index < width; index++) value = value * 256 + bytes[offset + index];
    if (!Number.isSafeInteger(value)) throw new Error("Invalid WebM EBML length");
    return { value, next: offset + width };
  }
  const root = integer(0, true);
  if (root.value !== 0x1a45dfa3) throw new Error("Invalid WebM EBML header");
  const header = integer(root.next);
  const end = header.next + header.value;
  if (header.value > 1024 || end > bytes.length) throw new Error("Invalid WebM EBML header length");
  let offset = header.next, webm = false;
  while (offset < end) {
    const element = integer(offset, true);
    const size = integer(element.next);
    offset = size.next + size.value;
    if (offset > end) throw new Error("Invalid WebM EBML element length");
    if (element.value === 0x4282) {
      if (webm || !bytes.subarray(size.next, offset).equals(Buffer.from("webm"))) throw new Error("Invalid WebM doctype");
      webm = true;
    }
  }
  if (!webm || integer(end, true).value !== 0x18538067) throw new Error("Invalid WebM doctype or segment");
}
