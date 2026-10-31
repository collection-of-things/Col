import { expandMotionLibrary } from "./motion-expansion-build.mjs";
import { updateMotionCatalog } from "./motion-catalog.mjs";
await expandMotionLibrary("nikala-ui");
await updateMotionCatalog("nikala-ui");
