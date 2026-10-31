import { expandMotionLibrary } from "./motion-expansion-build.mjs";
import { updateMotionCatalog } from "./motion-catalog.mjs";
await expandMotionLibrary("magicui-solid");
await updateMotionCatalog("magicui-solid");
