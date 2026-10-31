import { createSignal } from 'solid-js'

import { RadioGroup } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const options = [
  { value: 'apprentice', label: 'Apprentice' },
  { value: 'veteran', label: 'Veteran' },
  { value: 'legendary', label: 'Legendary' },
]

const [value, setValue] = createSignal('veteran');
return (<>
<div class="max-w-sm">
  <RadioGroup
    label="Difficulty"
    options={options}
    value={value()}
    onValueChange={setValue}
  />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
