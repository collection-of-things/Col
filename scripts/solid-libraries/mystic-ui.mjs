import { expandMotionLibrary } from "./motion-expansion-build.mjs";
import { updateMotionCatalog } from "./motion-catalog.mjs";
await expandMotionLibrary("mystic-ui");
await updateMotionCatalog("mystic-ui");
