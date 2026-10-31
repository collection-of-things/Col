import { Badge } from "@/components/ui/badge";
const importCode = `import { Badge } from "@/components/ui/badge";`;
const defaultCode = `<Badge>v0.4.0</Badge>`;
const variantsCode = `<div class="flex flex-wrap items-center gap-3">
  <Badge variant="default">Default</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="destructive">Destructive</Badge>
  <Badge variant="outline">Outline</Badge>
</div>`;
export default function Demo() {

return <>
                    <Badge>v0.5.0</Badge>
                </>;
}
