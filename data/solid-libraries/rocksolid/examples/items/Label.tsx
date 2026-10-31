import Input from "rocksolidjs/Input";
import Label from "rocksolidjs/Label";

export default function Example() {
  return (
    <div class="flex flex-col gap-1">
      <Label for="name">Name</Label>
      <Input
        id="name"
        placeholder="Enter your name"
      />
    </div>
  );
}
