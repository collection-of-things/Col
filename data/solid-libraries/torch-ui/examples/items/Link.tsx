import { Link } from '@torch-ui/solid/actions'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<p class="text-ink-700">
  Consult the <Link href="/actions/button">Tome of Buttons</Link> before venturing further.
</p>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
