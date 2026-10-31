import { createSignal } from 'solid-js'

import { Drawer } from '@torch-ui/solid/overlays'

import { Button } from '@torch-ui/solid/actions'



import { render } from "solid-js/web";
function Example() {

const [open, setOpen] = createSignal(false);
return (<>
<div>
  <Button onClick={() => setOpen(true)}>Open drawer</Button>
  <Drawer open={open()} onClose={() => setOpen(false)}>
    <h3 class="text-lg font-semibold text-ink-900">Drawer title</h3>
    <p class="mt-2 text-sm text-ink-600">Content slides in from the end (right).</p>
  </Drawer>
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
