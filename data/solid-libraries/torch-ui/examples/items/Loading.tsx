import { Button } from '@torch-ui/solid/actions'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Button loading>Loading...</Button>
<Button variant="outlined" loading>Loading...</Button>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
