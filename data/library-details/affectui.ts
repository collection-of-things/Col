import type { LibraryDetails } from "./types.ts";

export default {
  docsUrl: "https://www.affectui.com/docs/introduction",
  preview: {
    src: "https://www.affectui.com/og.jpg?v=2",
    alt: "affectUI website preview: React components for what AI agents do",
  },
  pricing: {
    model: "freemium",
    summary: "40 of the 129 items are free under MIT; the other 89 are affectUI Pro, a one-time $199 Individual or $499 Team license with lifetime updates.",
    license: "MIT (free items); commercial license (Pro)",
    source: "https://www.affectui.com/pricing",
  },
} satisfies LibraryDetails;
