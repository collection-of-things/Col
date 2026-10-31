import { createSignal } from 'solid-js'

import { Autocomplete } from '@torch-ui/solid/forms'

import type { AutocompleteOption } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const options: AutocompleteOption[] = [
  { value: 'warrior', label: 'Warrior' },
  { value: 'mage', label: 'Mage' },
  { value: 'rogue', label: 'Rogue' },
  { value: 'cleric', label: 'Cleric' },
  { value: 'ranger', label: 'Ranger' },
]

const [value, setValue] = createSignal('');
return (<>
<div class="w-full max-w-xs">
  <Autocomplete
    label="Class"
    options={options}
    value={value()}
    onValueChange={setValue}
    placeholder="Search classes..."
  />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
