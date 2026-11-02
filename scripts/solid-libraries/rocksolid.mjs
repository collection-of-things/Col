import { buildStyledLibrary } from "./styled-build.mjs";

await buildStyledLibrary("rocksolid", ["upstream/src/components/index.css", "theme.css", "docs-context.css"]);
