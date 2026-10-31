import { IconButton } from "@/components/ui/icon-button";
import { Settings, Trash2, Plus, Menu } from "lucide-solid";
const importCode = `import { IconButton } from "@/components/ui/icon-button";`;
const defaultCode = `<IconButton label="Open settings">
  <Settings />
</IconButton>`;
const variantsCode = `<div class="flex items-center gap-3">
  <IconButton label="Add item" variant="default">
    <Plus />
  </IconButton>
  <IconButton label="Open settings" variant="outline">
    <Settings />
  </IconButton>
  <IconButton label="Delete item" variant="destructive">
    <Trash2 />
  </IconButton>
</div>`;
const sizesCode = `<div class="flex items-center gap-3">
  <IconButton label="Small menu" size="sm">
    <Menu />
  </IconButton>
  <IconButton label="Default menu">
    <Menu />
  </IconButton>
  <IconButton label="Large menu" size="lg">
    <Menu />
  </IconButton>
</div>`;
export default function Demo() {

return <>
          <IconButton label="Open settings">
            <Settings />
          </IconButton>
        </>;
}
