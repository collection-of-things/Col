import { ToastProvider, useToast } from '@torch-ui/solid/feedback';
import { Button } from '@torch-ui/solid/actions';
function Demo() { const toast = useToast(); return <div class="flex flex-wrap gap-2"><Button size="sm" onClick={() => toast.show('Quest completed', undefined, {variant:'success'})}>Success</Button><Button size="sm" variant="outlined" onClick={() => toast.show('Spell backfired', undefined, {variant:'error'})}>Error</Button><Button size="sm" variant="outlined" onClick={() => toast.show('Mana reserves critical', undefined, {variant:'warning'})}>Warning</Button><Button size="sm" variant="outlined" onClick={() => toast.show('New contracts posted in Ashenveil', undefined, {variant:'info'})}>Info</Button><Button size="sm" variant="outlined" onClick={() => toast.show('The die has been cast')}>Default</Button></div> }
function Example() { return <ToastProvider><Demo /></ToastProvider> }
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <Example />, target); }
