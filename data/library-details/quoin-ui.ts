import type { LibraryDetails } from "./types";
import { QUOIN_SOURCE_URL, QUOIN_REVISION } from "../quoin/catalog.ts";

export default {
  docsUrl: `${QUOIN_SOURCE_URL}/blob/${QUOIN_REVISION}/README.md`,
  repoUrl: QUOIN_SOURCE_URL,
  pricing: {
    model: "free",
    summary: "Quoin is free and open source under the MIT license.",
    license: "MIT",
    source: `${QUOIN_SOURCE_URL}/blob/${QUOIN_REVISION}/LICENSE`,
  },
} satisfies LibraryDetails;
