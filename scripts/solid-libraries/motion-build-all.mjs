import { expandMotionLibrary } from "./motion-expansion-build.mjs";
for (const slug of process.argv.slice(2)) await expandMotionLibrary(slug);
