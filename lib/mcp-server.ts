import { McpServer } from "@modelcontextprotocol/server";
import {
  createCatalogueTools,
  getComponentArgs,
  getLibraryArgs,
  searchComponentsArgs,
  searchLibrariesArgs,
  type CatalogueData,
} from "./mcp-tools.ts";

/**
 * Adapts the tool layer to the MCP SDK. Every tool definition is served from
 * `lib/mcp-tools.ts`, so the schema a client sees and the validation `invoke`
 * performs come from one source; this module only wires the two together.
 */
export function createColMcpServer(data: CatalogueData): McpServer {
  const tools = createCatalogueTools(data);
  const server = new McpServer({ name: "col", version: "0.1.0" });

  const schemas = {
    search_libraries: searchLibrariesArgs,
    search_components: searchComponentsArgs,
    get_library: getLibraryArgs,
    get_component: getComponentArgs,
  } as const;

  for (const definition of tools.list()) {
    server.registerTool(
      definition.name,
      {
        title: definition.title,
        description: definition.description,
        inputSchema: schemas[definition.name as keyof typeof schemas],
        annotations: definition.annotations,
      },
      (args: Record<string, unknown>) => tools.invoke(definition.name, args),
    );
  }
  return server;
}
