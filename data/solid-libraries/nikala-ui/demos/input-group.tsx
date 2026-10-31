import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import { Search, Mail, Globe } from "lucide-solid";
const importCode = `import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";`;
const defaultCode = `<InputGroup class="max-w-sm">
  <InputGroupAddon align="inline-start">
    <Search class="w-4 h-4 text-muted-foreground" />
  </InputGroupAddon>
  <InputGroupInput placeholder="Search components..." />
  <InputGroupAddon align="inline-end">
    <KbdGroup>
      <Kbd size="sm">⌘</Kbd>
      <Kbd size="sm">K</Kbd>
    </KbdGroup>
  </InputGroupAddon>
</InputGroup>`;
const urlCode = `<InputGroup class="max-w-sm">
  <InputGroupAddon align="inline-start" class="text-xs font-mono">
    https://
  </InputGroupAddon>
  <InputGroupInput placeholder="nikala.dev" />
  <InputGroupAddon align="inline-end">
    <Globe class="w-4 h-4 text-muted-foreground" />
  </InputGroupAddon>
</InputGroup>`;
const emailCode = `<InputGroup class="max-w-sm">
  <InputGroupAddon align="inline-start">
    <Mail class="w-4 h-4 text-muted-foreground" />
  </InputGroupAddon>
  <InputGroupInput placeholder="nikala@pirosmani.ge" />
</InputGroup>`;
const actionCode = `<InputGroup class="max-w-sm">
  <InputGroupInput placeholder="Enter promo code" />
  <InputGroupAddon align="inline-end">
    <Button size="sm" class="h-7 text-xs">
      Apply
    </Button>
  </InputGroupAddon>
</InputGroup>`;
export default function Demo() {

return <>
          <InputGroup class="w-full max-w-sm">
            <InputGroupAddon align="inline-start">
              <Search class="w-4 h-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search components..." />
            <InputGroupAddon align="inline-end">
              <KbdGroup>
                <Kbd size="sm">⌘</Kbd>
                <Kbd size="sm">K</Kbd>
              </KbdGroup>
            </InputGroupAddon>
          </InputGroup>
        </>;
}
