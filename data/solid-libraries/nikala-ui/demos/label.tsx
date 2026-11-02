import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
const importCode = `import { Label } from "@/components/ui/label";`;
const defaultCode = `<div class="flex items-center space-x-2">
  <Checkbox id="terms-demo" />
  <Label for="terms-demo" class="cursor-pointer">
    Accept terms and conditions
  </Label>
</div>`;
const inputCode = `<div class="grid w-full max-w-sm items-center gap-1.5">
  <Label for="email-input">Email Address</Label>
  <Input type="email" id="email-input" placeholder="nikala@pirosmani.ge" />
</div>`;
const peerDisabledCode = `<div class="flex flex-col gap-4 max-w-sm w-full">
  <div class="flex items-center space-x-2">
    <Checkbox id="check-disabled" disabled />
    <Label for="check-disabled">Disabled Checkbox Label</Label>
  </div>

  <div class="grid gap-1.5">
    <Label for="input-disabled">Disabled Input Label</Label>
    <Input id="input-disabled" disabled placeholder="Disabled input field" />
  </div>
</div>`;
export default function Demo() {

return <>
          <div class="flex items-center space-x-2">
            <Checkbox id="terms-demo" />
            <Label for="terms-demo" class="cursor-pointer">
              Accept terms and conditions
            </Label>
          </div>
        </>;
}
