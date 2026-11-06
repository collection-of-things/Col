import { Link as RouterLink, type LinkComponent } from "@tanstack/react-router";

const exact = { exact: true, includeSearch: false };
const noActiveProps = {};

/**
 * The router's typed `Link`, marked active only on its exact page and without
 * an extra class, so each caller keeps control of its own `aria-current`
 * (section-level highlights, the docs pill).
 */
export const Link: LinkComponent<"a"> = (props) => <RouterLink activeOptions={exact} activeProps={noActiveProps} {...props} />;
