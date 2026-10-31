import packed from "../zaidan-packed.json" with { type: "json" };
import assets from "../../../solid-libraries/zaidan/assets.json" with { type: "json" };
import { decodeSolidPreviewArtifact } from "../packed.ts";

export default decodeSolidPreviewArtifact(packed, assets.assets);
