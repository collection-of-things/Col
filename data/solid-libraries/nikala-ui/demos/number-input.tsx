import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { createSignal } from "solid-js";
const importCode = `import { NumberInput } from "@/components/ui/number-input";`;
const defaultCode = `<NumberInput defaultValue={10} minValue={0} maxValue={100} />`;
const negativeCode = `<NumberInput defaultValue={-5} allowNegative minValue={-50} maxValue={50} />`;
const stepCode = `<NumberInput defaultValue={50} step={5} minValue={0} maxValue={100} />`;
const disabledCode = `<NumberInput defaultValue={15} disabled />`;
export default function Demo() {
const [val, setVal] = createSignal(5);
const [negativeVal, setNegativeVal] = createSignal(-10);
return <>
          <div class="flex flex-col space-y-2">
            <Label for="quantity">Quantity</Label>
            <NumberInput
              id="quantity"
              value={val()}
              onValueChange={setVal}
              minValue={0}
              maxValue={20}
            />
          </div>
        </>;
}
