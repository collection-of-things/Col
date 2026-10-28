import type { LibraryCorpusEntry } from "./types";
import api from "../quoin/documentation.json" with { type: "json" };
import readme from "../quoin/readme.json" with { type: "json" };
import examples from "../quoin/examples.json" with { type: "json" };
import { QUOIN_VERSION, QUOIN_VERIFIED_AT } from "../quoin/catalog.ts";

const { licenseNotice, ...setup } = readme;
const exampleSnapshots = Object.entries(examples).map(([name, example]) => ({
  title: `${name}: Solid example and CSS`,
  componentId: `quoin-ui/${name}`,
  url: example.source.url,
  fetchedAt: QUOIN_VERIFIED_AT,
  sourceRevision: example.source.revision,
  sources: [example.source, ...("sources" in example ? example.sources : [])],
  content: [
    `A Solid 2 example using quoin-ui@${QUOIN_VERSION}. Keep the TSX component and CSS in your application; the CSS supplies demo styling, not Quoin behavior.`,
    ...example.gaps,
    `\`\`\`tsx\n${example.code.trim()}\n\`\`\``,
    `\`\`\`css\n${example.css.trim()}\n\`\`\``,
    licenseNotice,
  ].join("\n\n"),
}));

/** API references are the published declarations, with their original MIT notice. */
export const quoinCorpus: LibraryCorpusEntry = {
  slug: "quoin-ui",
  permission: {
    status: "granted",
    source: `https://cdn.jsdelivr.net/npm/quoin-ui@${QUOIN_VERSION}/LICENSE`,
    checkedAt: QUOIN_VERIFIED_AT,
  },
  snapshots: [setup, ...Object.values(api), ...exampleSnapshots],
};
