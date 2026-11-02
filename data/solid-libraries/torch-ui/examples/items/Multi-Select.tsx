import { createSignal } from 'solid-js'

import { MultiSelect } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const options = [
  { value: 'goblin', label: 'Goblin' },
  { value: 'dragon', label: 'Dragon' },
  { value: 'orc', label: 'Orc' },
  { value: 'troll', label: 'Troll' },
]

const [value, setValue] = createSignal<string[]>([]);
return (<>
<div class="w-full max-w-xs">
  <MultiSelect
    label="Monsters"
    placeholder="Choose..."
    options={options}
    value={value()}
    onValueChange={setValue}
  />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
