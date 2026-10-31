import { createSignal } from 'solid-js'

import { Select } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const [value, setValue] = createSignal('')
const options = [
  { value: 'fighter', label: 'Fighter' },
  { value: 'wizard', label: 'Wizard' },
  { value: 'rogue', label: 'Rogue' },
  { value: 'cleric', label: 'Cleric' },
];
return (<>
<div class="w-full max-w-xs">
  <Select
    placeholder="Choose a class"
    options={options}
    value={value()}
    onValueChange={setValue}
  />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
