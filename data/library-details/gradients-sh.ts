import type { LibraryDetails } from "./types";

export default {
  docsUrl: "https://gradients.sh/docs",
  preview: {
    src: "https://gradients.sh/og.jpg",
    alt: "gradients.sh animated gradient components preview",
  },
  pricing: {
    model: "freemium",
    summary:
      "Twelve components and 39 presets are free under the MIT license; Pro adds 21 more components, 168 more presets, larger exports, and a commercial license.",
    license: "MIT (free components)",
    source: "https://gradients.sh/license",
  },
} satisfies LibraryDetails;
