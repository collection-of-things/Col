import { createSignal } from "solid-js";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
const importCode = `import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";`;
const defaultCode = `<div class="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label for="airplane-mode" class="cursor-pointer">
    Airplane Mode
  </Label>
</div>`;
const disabledCode = `<div class="flex flex-col gap-3">
  <div class="flex items-center space-x-2">
    <Switch id="disabled-off" disabled />
    <Label for="disabled-off" class="opacity-50">Disabled Off</Label>
  </div>

  <div class="flex items-center space-x-2">
    <Switch id="disabled-on" defaultChecked disabled />
    <Label for="disabled-on" class="opacity-50">Disabled On</Label>
  </div>
</div>`;
const controlledCode = `const [enabled, setEnabled] = createSignal(false);

return (
  <div class="space-y-3">
    <div class="flex items-center space-x-2">
      <Switch
        id="notifications"
        checked={enabled()}
        onChange={setEnabled}
      />
      <Label for="notifications" class="cursor-pointer">
        Push Notifications
      </Label>
    </div>
    <p class="text-xs font-mono text-muted-foreground">
      Status: {enabled() ? "Enabled" : "Disabled"}
    </p>
  </div>
);`;
export default function Demo() {
const [enabled, setEnabled] = createSignal(false);
return <>
          <div class="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <Label for="airplane-mode" class="cursor-pointer">
              Airplane Mode
            </Label>
          </div>
        </>;
}
