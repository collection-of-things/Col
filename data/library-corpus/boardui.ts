import type { LibraryCorpusEntry } from "./types.ts";
import documentation from "../boardui/documentation.json" with { type: "json" };
import audit from "../boardui/audit.json" with { type: "json" };

/** Only the free MIT source is reused; Pro entries remain links and factual summaries. */
export const boarduiCorpus: LibraryCorpusEntry = {
  slug: "boardui",
  permission: {
    status: "granted",
    source: "https://www.boardui.com/pricing",
    checkedAt: audit.checkedAt,
  },
  snapshots: documentation,
};
