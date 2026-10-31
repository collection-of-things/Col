import { createSignal } from 'solid-js'

import { RelativeDateDefaultInput } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const [value, setValue] = createSignal('today+0');
return (<>
<RelativeDateDefaultInput
  value={value()}
  onValueChange={setValue}
/>
<p>Stored: {value()}</p>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
