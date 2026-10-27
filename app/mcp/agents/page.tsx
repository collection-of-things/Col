import { DocsCode, DocsHeader, DocsLinks, DocsList, DocsNote, DocsSection, DocsText } from "@/components/DocsUI";
import { pageMetadata, siteUrl } from "@/lib/site";

export const metadata = pageMetadata(
  "/mcp/agents",
  "Col MCP agent guide | Col",
  "Set up Col MCP with an agent and use its tools to find, inspect, and implement UI components with source links and explicit gaps.",
);

export default function McpAgentsPage() {
  return (
    <article>
      <DocsHeader title="Col MCP for agents" lead="Connect once, find a component, then implement from its official documentation." />

      <DocsSection title="Set up the connection">
        <DocsText>Give this prompt to an agent that can configure your coding client. Setup is complete when the client connects and lists all five Col tools.</DocsText>
        <DocsCode code={`Set up Col MCP for the coding client I use.\nRead ${siteUrl}/mcp for client-specific instructions.\nAsk which client and configuration scope I want if they are unclear.\nAdd a server named col using Streamable HTTP at ${siteUrl}/api/mcp.\nInspect the current configuration first. Preserve all existing servers and settings.\nIf Col is already configured directly or through its plugin, reuse that connection.\nNo credentials or authentication headers are needed.\nTell me if I need to restart the client or enable the server myself.\nConfirm the connection lists search_libraries, search_components, get_library, get_component, and render_component.\nIf you cannot access the client’s tools, explain how I can verify them; do not claim the connection was tested.`} label="Agent setup prompt" />
      </DocsSection>

      <DocsSection title="Find a fit">
        <DocsText>Inspect the project’s framework, styling, and existing components first. Call <code>search_libraries</code> with short keywords and hard filters. Every stack filter must match, including multiple frameworks; use-case filters match at least one selected use case. Exact library names and slugs rank first among eligible results.</DocsText>
        <DocsCode code={JSON.stringify({ query: "command menu", stacks: ["React", "Tailwind CSS"], limit: 5 }, null, 2)} label="search_libraries arguments" />
        <DocsText>Use returned slugs for library lookups. Read <code>matchedComponents</code> and <code>evidence.gaps</code> before choosing a candidate. Search calls accept <code>limit</code> from 1 to 25 and a non-negative <code>offset</code>; use <code>total</code> to decide whether another page is needed.</DocsText>
        <DocsNote>Both search tools accept queries up to 4,096 Unicode code points. Search matches keywords, not conversational requirements or negation: a query such as “no Tailwind” does not exclude Tailwind. Use structured filters and verify remaining requirements in the official docs. Omit or leave the library query blank to browse; component search requires a nonempty query.</DocsNote>
      </DocsSection>

      <DocsSection title="Inspect the component">
        <DocsText>Call <code>search_components</code> with a documented name or alias. Optionally restrict the search to a library slug:</DocsText>
        <DocsCode code={JSON.stringify({ query: "command palette", library: "shadcn-ui", limit: 5 }, null, 2)} label="search_components arguments" />
        <DocsText>Pass the exact returned ID to <code>get_component</code>, then use <code>get_library</code> for official setup links, pricing, documentation, and recorded compatibility. Col records no install commands of its own: read the current official docs before installing. Libraries that request outbound-only listings omit setup links.</DocsText>
        <DocsCode code={JSON.stringify({ id: "shadcn-ui/Command" }, null, 2)} label="get_component arguments" />
        <DocsCode code={JSON.stringify({ slug: "shadcn-ui" }, null, 2)} label="get_library arguments" />
        <DocsNote>Component IDs are case-sensitive. Copy them from search results rather than constructing them. An unknown ID or invalid filter returns a tool error.</DocsNote>
      </DocsSection>

      <DocsSection title="Render it in the chat">
        <DocsText>Inspect <code>get_component.preview</code> first. If available, call <code>render_component</code> with the exact component <code>id</code>, optional user CSS in <code>styles</code>, and a <code>light</code> or <code>dark</code> theme. Col runs the real pinned package export or original upstream source with its required CSS and providers. Source previews include their revision and integrity hash. The agent cannot supply replacement code, imports, or component props.</DocsText>
        <DocsCode code={JSON.stringify({ id: "mantine/Button", theme: "dark", styles: ".mantine-Button-root { border-radius: 0; }" }, null, 2)} label="render_component arguments" />
        <DocsNote>This replaces the former code argument. Components without a verified implementation adapter return unavailable; do not substitute a generated imitation. Package versions, official documentation, and reproduction limits stay visible outside the styled frame. App data, fonts, routing, additional providers, and unsupplied CSS are not reproduced. A sent-to-chat result does not prove that the client rendered it.</DocsNote>
        <DocsText>Claude Code does not show MCP Apps. There, call <code>render_component</code> with <code>format: &quot;html&quot;</code> and show the returned <code>html</code> fragment: pass it unchanged to an inline HTML widget tool such as <code>show_widget</code>, or save it after a <code>&lt;!doctype html&gt;&lt;meta charset=&quot;utf-8&quot;&gt;</code> line as an <code>.html</code> file and open it in the browser. Errors in this fallback stay inside the render, so ask the user what they see.</DocsText>
        <DocsText>The HTML fallback uses a sandboxed iframe that separates the library preview from its embedding document. Preserve the sandbox and resize script when embedding it. Large original media requires MCP Apps server-resource access and reports unavailable in standalone HTML. Packages still load over the network; this boundary does not establish the safety of every package or replace a client’s own isolation controls.</DocsText>
      </DocsSection>

      <DocsSection title="Use the evidence">
        <DocsList items={[
          <>Keep <code>evidence.verification</code> and <code>evidence.gaps</code> in the recommendation. A verified component link does not verify every API, dependency, or variant.</>,
          "A missing component means it has not been recorded. Do not infer support from generic tags or treat an empty result as proof of absence.",
          "Compatibility is supported, unsupported, or unknown. Keep unknown constraints explicit and verify them against official documentation.",
          "Deep documentation snapshots may be absent. Follow the returned source URLs for current installation, API, examples, versions, and licensing.",
        ]} />
      </DocsSection>

      <DocsSection title="Implement in the project">
        <DocsList items={[
          "Read the chosen component’s official docs and confirm they fit the project’s versions and styling.",
          "Read the library’s own setup docs before installing anything. Install only what the selected component needs and follow the project’s conventions.",
          "Run the project’s relevant checks. Report the component, sources used, and anything that remains unverified.",
        ]} />
        <DocsText>Col supplies catalogue evidence. The coding agent performs project changes; the Col server does not read or modify the project.</DocsText>
        <DocsLinks items={[
          { href: "/mcp", title: "Client setup", text: "Connection commands, config snippets, plugins, and troubleshooting." },
          { href: "/docs/agents", title: "Agents and LLMs", text: "Plain-text discovery and contributing to Col." },
        ]} />
      </DocsSection>
    </article>
  );
}
