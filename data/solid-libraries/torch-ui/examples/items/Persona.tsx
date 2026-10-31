import { Persona } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Persona name="Caelan Torchward" />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
