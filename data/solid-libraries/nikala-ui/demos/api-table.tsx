import { ApiTable, type ApiTableItem } from "@/components/ui/api-table";
const importCode = `import { ApiTable, type ApiTableItem } from "@/components/ui/api-table";`;
const sampleItems: ApiTableItem[] = [
  {
    prop: "variant",
    type: '"default" | "primary" | "outline" | "ghost" | "destructive"',
    default: '"default"',
    description: "Visual style variant applied to the button.",
  },
  {
    prop: "size",
    type: '"xs" | "sm" | "default" | "lg" | "icon"',
    default: '"default"',
    description: "Size dimensions and internal padding scale.",
  },
  {
    prop: "disabled",
    type: "boolean",
    default: "false",
    description: "Whether user interaction and events are disabled.",
  },
  {
    prop: "onClick",
    type: "(event: MouseEvent) => void",
    default: "undefined",
    description: "Event handler callback triggered on click.",
  },
];
const defaultCode = `<ApiTable
  title="Button"
  badge="Props"
  description="All reactive properties and event bindings supported by the Button component."
  items={[
    {
      prop: "variant",
      type: '"default" | "primary" | "outline" | "ghost" | "destructive"',
      default: '"default"',
      description: "Visual style variant applied to the button.",
    },
    {
      prop: "size",
      type: '"xs" | "sm" | "default" | "lg" | "icon"',
      default: '"default"',
      description: "Size dimensions and internal padding scale.",
    },
    {
      prop: "disabled",
      type: "boolean",
      default: "false",
      description: "Whether user interaction and events are disabled.",
    },
  ]}
/>`;
export default function Demo() {

return <>
          <div class="w-full">
            <ApiTable
              title="Button"
              badge="Props"
              description="All reactive properties and event bindings supported by the Button component."
              items={sampleItems}
            />
          </div>
        </>;
}
