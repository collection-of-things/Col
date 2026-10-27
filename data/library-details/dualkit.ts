import type { LibraryDetails } from "./types";

export default {
  docsUrl: "https://dualkit.dev/docs",
  repoUrl: "https://github.com/dualkit/dualkit",
  preview: {
    src: "https://dualkit.dev/opengraph-image.png",
    alt: "Dualkit. Build for the Gulf. In both directions.",
  },
  pricing: {
    model: "free",
    summary:
      "Dualkit is free and open source under the MIT license, with no paid tier: the agent skills, @dualkit/format, the eight starter components, check, lint and convert all ship as a v0.1 beta.",
    license: "MIT",
    source: "https://github.com/dualkit/dualkit/blob/main/LICENSE",
  },
} satisfies LibraryDetails;
