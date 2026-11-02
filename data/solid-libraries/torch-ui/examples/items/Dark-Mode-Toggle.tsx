import { DarkModeToggle } from '@torch-ui/solid/actions'



import { render } from "solid-js/web";
function Example() {

{/* Icon button (default) — persists to localStorage */};
return (<>
<DarkModeToggle storageKey={false} />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
