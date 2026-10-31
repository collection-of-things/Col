import { createSignal } from 'solid-js'

import { AlertDialog } from '@torch-ui/solid/feedback'

import { Button } from '@torch-ui/solid/actions'



import { render } from "solid-js/web";
function Example() {

const [open, setOpen] = createSignal(false);
return (<>
<div>
  <Button onClick={() => setOpen(true)}>Forge Alliance</Button>
  <AlertDialog
    open={open()}
    onOpenChange={setOpen}
    title="Forge Alliance with the Iron Throne?"
    description="This pact will bind your guild to the Iron Throne for one year."
    confirmLabel="Seal the Pact"
    onConfirm={() => { /* forge alliance */ }}
  />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
