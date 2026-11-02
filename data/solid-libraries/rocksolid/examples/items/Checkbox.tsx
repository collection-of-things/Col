import Checkbox from "rocksolidjs/Checkbox";
import Label from "rocksolidjs/Label";

export default function Example() {
  return (
    <div class="flex items-center gap-1">
      <Checkbox id="notifications" />
      <Label for="notifications">
        Enable notifications
      </Label>
    </div>
  );
}
