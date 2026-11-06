import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DocsLayout } from "@/components/DocsLayout";

export const Route = createFileRoute("/mcp")({
  component: () => <DocsLayout><Outlet /></DocsLayout>,
});
