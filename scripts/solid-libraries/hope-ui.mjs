import { buildStyledLibrary } from "./styled-build.mjs";

await buildStyledLibrary("hope-ui", [
  "upstream/packages/presets/src/hope/tailwind.css",
  "upstream/packages/presets/src/hope/theme.css",
]);
