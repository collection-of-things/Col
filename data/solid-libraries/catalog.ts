import type { Library } from "../libraries.ts";
import type { LibraryComponent } from "../components.ts";
import type { CompatibilityFact } from "../compatibility.ts";
import type { LibraryDetails } from "../library-details/types.ts";
import kobalte from "./kobalte/catalog.json" with { type: "json" };
import solidUi from "./solid-ui/catalog.json" with { type: "json" };
import shadcnSolid from "./shadcn-solid/catalog.json" with { type: "json" };
import zaidan from "./zaidan/catalog.json" with { type: "json" };
import hopeUi from "./hope-ui/catalog.json" with { type: "json" };
import rocksolid from "./rocksolid/catalog.json" with { type: "json" };
import nikalaUi from "./nikala-ui/catalog.json" with { type: "json" };
import torchUi from "./torch-ui/catalog.json" with { type: "json" };
import magicuiSolid from "./magicui-solid/catalog.json" with { type: "json" };
import mysticUi from "./mystic-ui/catalog.json" with { type: "json" };

interface SolidCatalog {
  library: Library;
  details: LibraryDetails;
  components: LibraryComponent[];
  compatibility: CompatibilityFact[];
}

/** Metadata is separate from source snapshots so the website only loads catalog data. */
export const solidCatalogs = {
  kobalte,
  "solid-ui": solidUi,
  "shadcn-solid": shadcnSolid,
  zaidan,
  "hope-ui": hopeUi,
  rocksolid,
  "nikala-ui": nikalaUi,
  "torch-ui": torchUi,
  "magicui-solid": magicuiSolid,
  "mystic-ui": mysticUi,
} as Record<string, SolidCatalog>;
