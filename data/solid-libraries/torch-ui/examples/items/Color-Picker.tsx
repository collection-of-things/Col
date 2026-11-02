import { createSignal } from 'solid-js';import { ColorPicker } from '@torch-ui/solid/forms'


import { render } from "solid-js/web";
function Example() {
const [color, setColor] = createSignal('#3b82f6');
;
return (<>
<div class="w-full max-w-md">
  <ColorPicker
    label="Accent color"
    value={color()}
    onValueChange={setColor}
  />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
