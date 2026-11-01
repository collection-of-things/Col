import { solidCatalogs } from "../data/solid-libraries/catalog.ts";

// @ts-expect-error Unknown catalog slugs must not typecheck.
solidCatalogs["not-a-solid-library"];
