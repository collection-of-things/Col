import kobalte from "./kobalte.json" with { type: "json" };
import solidUi from "./solid-ui.json" with { type: "json" };
import shadcnSolid from "./shadcn-solid.json" with { type: "json" };
import zaidan from "./zaidan.json" with { type: "json" };
import hopeUi from "./hope-ui.json" with { type: "json" };
import rocksolid from "./rocksolid.json" with { type: "json" };
import nikalaUi from "./nikala-ui.json" with { type: "json" };
import torchUi from "./torch-ui.json" with { type: "json" };
import magicuiSolid from "./magicui-solid.json" with { type: "json" };
import mysticUi from "./mystic-ui.json" with { type: "json" };

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
  }[];
  gaps: string[];
}

export const solidPreviews: Readonly<Record<string, SolidPreview>> = {
  ...kobalte.entries, ...solidUi.entries, ...shadcnSolid.entries, ...zaidan.entries, ...hopeUi.entries,
  ...rocksolid.entries, ...nikalaUi.entries, ...torchUi.entries, ...magicuiSolid.entries, ...mysticUi.entries,
};
