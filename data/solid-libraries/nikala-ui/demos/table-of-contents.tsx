import { TableOfContents } from "@/components/ui/table-of-contents";
const importCode = `import { TableOfContents } from "@/components/ui/table-of-contents";`;
const defaultCode = `<TableOfContents
  title="On this page"
  items={[
    { id: "overview", text: "Overview", depth: 2 },
    { id: "installation", text: "Installation", depth: 2 },
    { id: "package-managers", text: "Package Managers", depth: 3 },
    { id: "configuration", text: "Configuration", depth: 2 },
    { id: "tailwind-setup", text: "Tailwind Setup", depth: 3 },
    { id: "api-reference", text: "API Reference", depth: 2 },
  ]}
/>`;
const sampleItems = [
  { id: "overview", text: "Overview", depth: 2 },
  { id: "installation", text: "Installation", depth: 2 },
  { id: "package-managers", text: "Package Managers", depth: 3 },
  { id: "configuration", text: "Configuration", depth: 2 },
  { id: "tailwind-setup", text: "Tailwind Setup", depth: 3 },
  { id: "api-reference", text: "API Reference", depth: 2 },
];
export default function Demo() {

return <>
          <div class="w-full max-w-xs rounded-lg border border-border bg-card p-2">
            <TableOfContents
              title="On this page"
              items={sampleItems}
              activeId="installation"
            />
          </div>
        </>;
}
