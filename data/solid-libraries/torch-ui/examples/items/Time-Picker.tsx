import { createSignal } from 'solid-js'

import { TimePicker } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const [time, setTime] = createSignal('');
return (<>
<div class="w-full max-w-xs">
  <TimePicker
    label="Tavern curfew"
    placeholder="Set the hour..."
    value={time()}
    onValueChange={setTime}
  />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
