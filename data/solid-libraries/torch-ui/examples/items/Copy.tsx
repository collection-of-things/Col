import { Copy } from '@torch-ui/solid/actions'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Copy text="https://example.com/share-link" />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
