import { createSignal } from 'solid-js'

import { NumberField } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const [value, setValue] = createSignal<number | undefined>(10);
return (<>
<div class="max-w-xs">
  <NumberField
    label="Hit Points"
    value={value()}
    onValueChange={setValue}
    minValue={0}
    maxValue={20}
    showStepper
  />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
