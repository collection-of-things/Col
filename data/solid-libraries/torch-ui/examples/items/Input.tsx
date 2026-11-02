import { createSignal } from 'solid-js'

import { Input } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const [value, setValue] = createSignal('');
return (<>
<div class="w-full max-w-xs">
  <Input
    label="Character Name"
    placeholder="e.g. Arindel Moonshadow"
    value={value()}
    onValueChange={setValue}
  />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
