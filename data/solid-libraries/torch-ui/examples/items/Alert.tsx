import { Alert } from '@torch-ui/solid/feedback'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Alert status="error">
  Your lockpick shattered. The vault door remains sealed.
</Alert>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
