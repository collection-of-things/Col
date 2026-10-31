import { Divider } from '@torch-ui/solid/layout'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<p class="text-sm text-ink-600">Content above.</p>
<Divider />
<p class="text-sm text-ink-600">Content below.</p>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
