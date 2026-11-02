import { Sparkline } from '@torch-ui/solid/charts'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Sparkline data={[12, 14, 10, 16, 14, 18, 15]} />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
