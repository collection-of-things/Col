import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-solid";
const importCode = `import { Button } from "@/components/ui/button";`;
const defaultCode = `<Button>Button</Button>`;
const secondaryCode = `<Button variant="secondary">Secondary</Button>`;
const destructiveCode = `<Button variant="destructive">Destructive</Button>`;
const outlineCode = `<Button variant="outline">Outline</Button>`;
const ghostCode = `<Button variant="ghost">Ghost</Button>`;
const linkCode = `<Button variant="link">Link</Button>`;
const iconCode = `<Button variant="outline" size="icon" aria-label="Add item">
  <Plus />
</Button>`;
const sizesCode = `<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>`;
const loadingCode = `<Button loading>Saving changes...</Button>`;
export default function Demo() {

return <>
        <Button>Button</Button>
      </>;
}
