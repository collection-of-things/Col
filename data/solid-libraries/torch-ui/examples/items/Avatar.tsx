import { Avatar } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Avatar name="Lyra Dawnseeker" />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
