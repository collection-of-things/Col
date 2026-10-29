import type { LibraryCorpusEntry } from "./types.ts";
import kobalte from "../solid-libraries/kobalte/corpus.json" with { type: "json" };
import solidUi from "../solid-libraries/solid-ui/corpus.json" with { type: "json" };
import shadcnSolid from "../solid-libraries/shadcn-solid/corpus.json" with { type: "json" };
import zaidan from "../solid-libraries/zaidan/corpus.json" with { type: "json" };
import hopeUi from "../solid-libraries/hope-ui/corpus.json" with { type: "json" };
import rocksolid from "../solid-libraries/rocksolid/corpus.json" with { type: "json" };
import nikalaUi from "../solid-libraries/nikala-ui/corpus.json" with { type: "json" };
import torchUi from "../solid-libraries/torch-ui/corpus.json" with { type: "json" };
import magicuiSolid from "../solid-libraries/magicui-solid/corpus.json" with { type: "json" };
import mysticUi from "../solid-libraries/mystic-ui/corpus.json" with { type: "json" };

export const solidCorpora = [kobalte, solidUi, shadcnSolid, zaidan, hopeUi, rocksolid, nikalaUi, torchUi, magicuiSolid, mysticUi] as LibraryCorpusEntry[];
