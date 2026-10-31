import { Kbd } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Kbd>K</Kbd>
<Kbd>Enter</Kbd>
<Kbd>Esc</Kbd>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
