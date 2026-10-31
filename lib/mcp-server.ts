import { McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import { readPreviewMediaChunk } from "./component-preview-assets.ts";
import { createCatalogueTools, type CatalogueData } from "./mcp-tools.ts";
import { PREVIEW_WIDGET_CSP, PREVIEW_WIDGET_MIME, PREVIEW_WIDGET_URI, previewWidgetHtml } from "./preview-widget.ts";

/**
 * Adapts the tool layer to the MCP SDK. Each tool definition carries the very
 * zod schema `invoke` validates with, so the schema a client sees and the
 * validation it receives can never drift; this module only wires them together.
 *
 * It also registers the MCP Apps view that `render_component` links to through
 * `_meta.ui.resourceUri`, so hosts with the extension render the library's
 * component inline in the chat.
 */
export function createColMcpServer(data: CatalogueData): McpServer {
  const tools = createCatalogueTools(data);
  const server = new McpServer({ name: "col", version: "0.1.0" });

  for (const definition of tools.list()) {
    server.registerTool(
      definition.name,
      {
        title: definition.title,
        description: definition.description,
        inputSchema: definition.args,
        annotations: definition.annotations,
        _meta: definition.meta,
      },
      (args) => {
        const result = tools.invoke(definition.name, args);
        if (definition.name === "render_component" && result.structuredContent?.status === "html" && Buffer.byteLength(JSON.stringify(result)) > 4_000_000) {
          const preview = result.structuredContent.preview;
          if (preview && typeof preview === "object" && "code" in preview) {
            const { code: _code, ...identity } = preview;
            const payload = { ...result.structuredContent, preview: identity };
            const compact = { ...result, content: [{ type: "text" as const, text: JSON.stringify(payload) }] };
            if (Buffer.byteLength(JSON.stringify(compact)) <= 4_000_000) return compact;
            const note = "The complete selected implementation is embedded in the HTML; its redundant preview.code field is omitted to fit the transport limit.";
            const smaller = { ...payload, transportNote: note };
            return { ...result, content: [{ type: "text" as const, text: JSON.stringify(smaller) }], structuredContent: smaller };
          }
        }
        if (definition.name !== "render_component" || result.structuredContent?.status !== "sent-to-chat") return result;
        const preview = result.structuredContent.preview;
        if (!preview || typeof preview !== "object" || !("code" in preview) || !("media" in preview) || !("requestKey" in preview)) return result;
        const { code, media, ...identity } = preview;
        const payload = { ...result.structuredContent, preview: identity };
        // Source bundles belong to the view, not the model's text context.
        return {
          ...result,
          content: [{ type: "text" as const, text: JSON.stringify(payload) }],
          structuredContent: payload,
          _meta: { "col/preview": { requestKey: identity.requestKey, code, media } },
        };
      },
    );
  }

  const widgetMeta = { ui: { csp: PREVIEW_WIDGET_CSP } };
  server.registerResource(
    "Component preview",
    PREVIEW_WIDGET_URI,
    {
      title: "Component preview",
      description: "Renders the server-selected library implementation with visible provenance and reproduction limits.",
      mimeType: PREVIEW_WIDGET_MIME,
      _meta: widgetMeta,
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: PREVIEW_WIDGET_MIME, text: previewWidgetHtml(), _meta: widgetMeta }],
    }),
  );

  server.registerResource("Demo media chunk", new ResourceTemplate("col://preview-media/{sha256}/{part}", { list: undefined }), {
    description: "Hash-verified, bounded bytes of fixed demo media. No arbitrary file or network access.",
    mimeType: "application/octet-stream",
  }, async (uri, { sha256, part }) => {
    if (typeof sha256 !== "string" || typeof part !== "string") throw new Error("Invalid original media resource");
    return { contents: [{ uri: uri.href, mimeType: "application/octet-stream", blob: await readPreviewMediaChunk(sha256, part) }] };
  });
  return server;
}
