import { PageHeading } from '@torch-ui/solid/layout'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<PageHeading title="Section" level={2} />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
