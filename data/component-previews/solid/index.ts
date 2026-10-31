import { decodeSolidPreviewArtifact } from "./packed.ts";
export { decodeSolidPreviewArtifact } from "./packed.ts";
import kobaltePacked from "./kobalte-packed.json" with { type: "json" };
import solidUiPacked from "./solid-ui-packed.json" with { type: "json" };
import solidUiAssets from "../../solid-libraries/solid-ui/assets.json" with { type: "json" };
import shadcnSolidPacked from "./shadcn-solid-packed.json" with { type: "json" };
import zaidan from "./zaidan/index.ts";
import hopeUi from "./hope-ui.json" with { type: "json" };
import hopeUiExpanded from "./hope-ui-expanded.json" with { type: "json" };
import rocksolid from "./rocksolid.json" with { type: "json" };
import rocksolidExpanded from "./rocksolid-expanded.json" with { type: "json" };
import nikalaUi from "./nikala-ui/index.ts";
import torchUi from "./torch-ui.json" with { type: "json" };
import torchUiExpandedPacked from "./torch-ui-expanded-packed.json" with { type: "json" };
import magicuiSolid from "./magicui-solid/index.ts";
import mysticUi from "./mystic-ui/index.ts";

export interface SolidPreview {
  code: string;
  css: string;
  package: string;
  version: string;
  runtimeVersion: string;
  exportName: string;
  source: { url: string; revision: string; integrity: string };
  assets?: {
    url: string;
    downloadUrl: string;
    resolvedUrl: string;
    sha256: string;
    mediaType: string;
    bytes: number;
    attribution: { name: string; license: string; url: string };
    licenseUrl?: string;
    original?: { sha256: string; bytes: number };
    transformation?: string;
  }[];
  gaps: string[];
}

type GroupedPreview = Omit<SolidPreview, "code" | "css"> & { group: string };
export type SolidUnavailable = { reason: string; source?: SolidPreview["source"]; gaps?: string[] };
export type SolidPreviewArtifact = {
  entries: Record<string, SolidPreview | GroupedPreview>;
  groups?: Record<string, { code: string; style: string }>;
  styles?: Record<string, string>;
  unavailable?: Record<string, SolidUnavailable>;
  sources?: { url: string; integrity: string }[];
  notices?: { url: string; text: string }[];
};

/** Expand reviewed shared bundles without duplicating them in every catalog entry. */
export function expandSolidPreviewArtifact(artifact: SolidPreviewArtifact): Record<string, SolidPreview> {
  return Object.fromEntries(Object.entries(artifact.entries).map(([id, entry]) => {
    if (!("group" in entry)) return [id, entry];
    const group = artifact.groups?.[entry.group];
    const css = group && artifact.styles?.[group.style];
    return [id, { ...entry, code: group?.code ?? "", css: css ?? "" }];
  }));
}

const artifacts: SolidPreviewArtifact[] = [decodeSolidPreviewArtifact(kobaltePacked), decodeSolidPreviewArtifact(solidUiPacked, solidUiAssets.assets), decodeSolidPreviewArtifact(shadcnSolidPacked), zaidan, hopeUi, hopeUiExpanded, rocksolid, rocksolidExpanded, nikalaUi, torchUi, decodeSolidPreviewArtifact(torchUiExpandedPacked), magicuiSolid, mysticUi];
export const solidPreviews: Readonly<Record<string, SolidPreview>> = Object.assign({}, ...artifacts.map(expandSolidPreviewArtifact));
export const solidUnavailable: Readonly<Record<string, SolidUnavailable>> = Object.assign({}, ...artifacts.map(artifact => artifact.unavailable ?? {}));
