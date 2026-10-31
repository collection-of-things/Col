import { createSignal } from 'solid-js'

import { DatePicker } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const [date, setDate] = createSignal('');
return (<>
<div class="w-full max-w-xs">
  <DatePicker
    label="Quest start"
    placeholder="Select a date"
    value={date()}
    onValueChange={setDate}
  />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
