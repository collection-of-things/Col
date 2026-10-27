/** Web Awesome's official system resolver returns bundled SVG data URIs, but its
 * default icon loader fetches them. Use its sprite/mutator extension to insert
 * those same SVG nodes locally under connect-src 'none'. The original resolver,
 * artwork, comments, attributes and fill mutator remain authoritative. */
export const webAwesomeSystemIconSetup = `
import { getIconLibrary as colGetIconLibrary, registerIconLibrary as colRegisterIconLibrary } from "@awesome.me/webawesome@3.14.0/dist/components/icon/library.js";
const colOriginalSystemIcons = colGetIconLibrary("system");
if (!colOriginalSystemIcons) throw new Error("Original Web Awesome system icon library is unavailable.");
const colSystemIconDocuments = new Map();
colRegisterIconLibrary("system", {
  spriteSheet: true,
  resolver: (name, family, variant, autoWidth) => "#col-system-icon-" + encodeURIComponent(JSON.stringify([name, family, variant, autoWidth])),
  mutator: (svg, host) => {
    if (!host) throw new Error("Web Awesome system icon host is unavailable.");
    const uri = colOriginalSystemIcons.resolver(host.name, host.family, host.variant, host.autoWidth);
    const prefix = "data:image/svg+xml,";
    if (typeof uri !== "string" || !uri.startsWith(prefix)) throw new Error("Original Web Awesome system icon is not an inline SVG.");
    let original = colSystemIconDocuments.get(uri);
    if (!original) {
      const source = new DOMParser().parseFromString(decodeURIComponent(uri.slice(prefix.length)), "image/svg+xml");
      if (source.querySelector("parsererror") || source.documentElement.localName !== "svg") throw new Error("Original Web Awesome system icon could not be decoded.");
      original = source.documentElement;
      colSystemIconDocuments.set(uri, original);
    }
    for (const attribute of original.attributes) svg.setAttribute(attribute.name, attribute.value);
    svg.replaceChildren(...Array.from(original.childNodes, node => node.cloneNode(true)));
    colOriginalSystemIcons.mutator?.(svg, host);
  },
});
`;
