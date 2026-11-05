import { createRouter } from "@tanstack/react-router";
import { NotFound } from "@/components/NotFound";
import { parseSearch, stringifySearch } from "@/lib/directory-query";
import { routeTree } from "./routeTree.gen";

/** Builds the router for each request on the server and once in the browser. */
export function getRouter() {
  return createRouter({
    routeTree,
    defaultNotFoundComponent: NotFound,
    defaultPreload: "intent",
    // Plain-text search params, as Next.js read them: `?q=123` searches for "123".
    parseSearch,
    stringifySearch,
  });
}
