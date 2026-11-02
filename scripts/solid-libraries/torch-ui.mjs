import { buildStyledLibrary } from "./styled-build.mjs";

await buildStyledLibrary("torch-ui", ["upstream/styles/theme.css", "docs-context.css"]);
