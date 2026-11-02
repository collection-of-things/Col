import { Tag } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Tag>Concentrating</Tag>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
