import { createSignal } from 'solid-js'

import { Checkbox } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const [checked, setChecked] = createSignal(true);
return (<>
<div class="flex flex-wrap items-center gap-6">
  <Checkbox checked={checked()} onValueChange={setChecked} label="Checked" />
  <Checkbox label="Unchecked" />
  <Checkbox disabled label="Disabled" />
  <Checkbox checked disabled label="Disabled checked" />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
