import seedPacked from "../nikala-ui.json" with { type: "json" };
import expandedPacked from "./expanded.json" with { type: "json" };
import { decodeSolidPreviewArtifact } from "../packed.ts";
const expanded=decodeSolidPreviewArtifact(expandedPacked);
const seed=decodeSolidPreviewArtifact(seedPacked);
if (!seed.sources || !seed.notices) throw new Error("Baseline provenance is missing");

export default { ...expanded, entries: { ...seed.entries, ...expanded.entries }, groups: { ...expanded.groups,  }, sources: [...new Map([...seed.sources, ...(expanded.sources??[])].map(item => [item.url, item])).values()], notices: [...new Map([...seed.notices, ...(expanded.notices??[])].map(item => [item.url, item])).values()] };
