import Label from "rocksolidjs/Label";
import Switch from "rocksolidjs/Switch";

export default function Example() {
  return (
    <div class="flex items-center gap-2">
      <Switch id="notifications" />
      <Label for="notifications">Enable notifications</Label>
    </div>
  );
}
