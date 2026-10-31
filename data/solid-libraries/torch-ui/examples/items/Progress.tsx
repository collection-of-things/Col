import { Progress } from '@torch-ui/solid/feedback'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Progress value={0} aria-label="Progress" />
<Progress value={45} aria-label="Progress" />
<Progress value={100} aria-label="Progress" />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
