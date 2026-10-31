import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
const importCode = `import { Kbd, KbdGroup } from "@/components/ui/kbd";`;
const defaultCode = `<KbdGroup>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>`;
const variantsCode = `<div class="flex items-center gap-4">
  <Kbd variant="default">Ctrl + C</Kbd>
  <Kbd variant="outline">⌘ + Shift + P</Kbd>
</div>`;
const sizesCode = `<div class="flex items-center gap-4">
  <Kbd size="sm">Small ⌘K</Kbd>
  <Kbd size="md">Default ⌘K</Kbd>
  <Kbd size="lg">Large ⌘K</Kbd>
</div>`;
const groupCode = `<KbdGroup>
  <Kbd>Ctrl</Kbd>
  <Kbd>Alt</Kbd>
  <Kbd>Delete</Kbd>
</KbdGroup>`;
const inButtonCode = `<Button variant="outline" size="sm" class="gap-2">
  <span>Search documentation...</span>
  <KbdGroup>
    <Kbd size="sm">⌘</Kbd>
    <Kbd size="sm">K</Kbd>
  </KbdGroup>
</Button>`;
export default function Demo() {

return <>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </>;
}
