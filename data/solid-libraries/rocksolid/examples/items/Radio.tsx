import Radio from "rocksolidjs/Radio";
import Label from "rocksolidjs/Label";

export default function Example() {
  return (
    <div class="flex items-center gap-1">
      <Radio
        id="notifications"
        value="notifications"
      />
      <Label for="notifications">
        Enable notifications
      </Label>
    </div>
  );
}
