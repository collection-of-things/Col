import { createSignal } from 'solid-js'

import { TextArea } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const [value, setValue] = createSignal('');
return (<>
<div class="w-full max-w-md">
  <TextArea
    label="Quest Notes"
    placeholder="Describe your findings..."
    value={value()}
    onValueChange={setValue}
    rows={4}
  />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
