import { Slider } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Slider label="Spell Power" defaultValue={[50]} />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
