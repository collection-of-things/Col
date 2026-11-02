import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const importCode = `import { Input } from "@/components/ui/input";`;
const defaultCode = `<Input type="email" placeholder="Email" class="max-w-xs" />`;
const withLabelCode = `<div class="grid w-full max-w-sm items-center gap-1.5">
  <Label for="email">Email address</Label>
  <Input type="email" id="email" placeholder="nikala@pirosmani.ge" />
</div>`;
const typesCode = `<div class="flex flex-col gap-4 max-w-sm w-full">
  <div class="grid gap-1.5">
    <Label for="text-demo">Text Input</Label>
    <Input type="text" id="text-demo" placeholder="Niko Pirosmani" />
  </div>

  <div class="grid gap-1.5">
    <Label for="password-demo">Password Input</Label>
    <Input type="password" id="password-demo" value="secretpassword" />
  </div>

  <div class="grid gap-1.5">
    <Label for="file-demo">File Upload Input</Label>
    <Input type="file" id="file-demo" />
  </div>
</div>`;
const disabledCode = `<Input disabled type="email" placeholder="Email" value="disabled@pirosmani.ge" class="max-w-xs" />`;
export default function Demo() {

return <>
          <Input type="email" placeholder="Email" class="max-w-xs" />
        </>;
}
