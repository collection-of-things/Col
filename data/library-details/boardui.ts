import type { LibraryDetails } from "./types.ts";

export default {
  docsUrl: "https://www.boardui.com/installation",
  repoUrl: "https://github.com/BoardUI/boardui",
  pricing: {
    model: "freemium",
    summary: "Free components ship as MIT-licensed source. Pro requires a paid license for additional agent components, charts, and templates.",
    license: "MIT (free components); commercial license (Pro)",
    source: "https://www.boardui.com/pricing",
  },
} satisfies LibraryDetails;
