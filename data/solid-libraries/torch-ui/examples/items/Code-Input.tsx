import { createSignal } from 'solid-js'

import { CodeInput } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const [code, setCode] = createSignal('');
return (<>
<div class="w-full max-w-xs">
  <CodeInput
    label="Arcane Seal"
    placeholder="000000"
    value={code()}
    onValueChange={setCode}
  />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
