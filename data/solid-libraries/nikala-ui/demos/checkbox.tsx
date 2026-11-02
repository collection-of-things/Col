import { createSignal } from "solid-js";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
const importCode = `import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";`;
const defaultCode = `<div class="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label for="terms" class="cursor-pointer">
    Accept terms and conditions
  </Label>
</div>`;
const disabledCode = `<div class="flex flex-col gap-3">
  <div class="flex items-center space-x-2">
    <Checkbox id="disabled-1" disabled />
    <Label for="disabled-1" class="opacity-50">Disabled unchecked</Label>
  </div>

  <div class="flex items-center space-x-2">
    <Checkbox id="disabled-2" defaultChecked disabled />
    <Label for="disabled-2" class="opacity-50">Disabled checked</Label>
  </div>
</div>`;
const formListCode = `<div class="space-y-4 max-w-sm rounded-lg border border-border p-4 bg-card">
  <div class="space-y-1">
    <h4 class="text-sm font-semibold">Notification Preferences</h4>
    <p class="text-xs text-muted-foreground">Select the types of emails you would like to receive.</p>
  </div>
  <div class="space-y-3 pt-2">
    <div class="flex items-start space-x-2">
      <Checkbox id="marketing" defaultChecked class="mt-0.5" />
      <div class="grid gap-1 leading-none">
        <Label for="marketing" class="text-xs font-medium cursor-pointer">Marketing emails</Label>
        <p class="text-[11px] text-muted-foreground">Receive promotional news and feature releases.</p>
      </div>
    </div>

    <div class="flex items-start space-x-2">
      <Checkbox id="security" defaultChecked disabled class="mt-0.5" />
      <div class="grid gap-1 leading-none">
        <Label for="security" class="text-xs font-medium opacity-70">Security alerts</Label>
        <p class="text-[11px] text-muted-foreground">Mandatory system and login security notices.</p>
      </div>
    </div>
  </div>
</div>`;
const controlledCode = `const [agreed, setAgreed] = createSignal(false);

return (
  <div class="space-y-3">
    <div class="flex items-center space-x-2">
      <Checkbox
        id="controlled"
        checked={agreed()}
        onChange={(val) => setAgreed(val)}
      />
      <Label for="controlled" class="cursor-pointer">
        Subscribe to newsletter
      </Label>
    </div>
    <p class="text-xs text-muted-foreground">
      Status: {agreed() ? "Subscribed" : "Unsubscribed"}
    </p>
  </div>
);`;
export default function Demo() {
const [agreed, setAgreed] = createSignal(false);
return <>
                    <div class="flex items-center space-x-2">
                        <Checkbox id="terms" />
                        <Label for="terms" class="cursor-pointer">
                            Accept terms and conditions
                        </Label>
                    </div>
                </>;
}
