import { Wizard } from '@torch-ui/solid/layout'



import { render } from "solid-js/web";
function Example() {

const step = 2 // from your state (e.g. createSignal)
const labels = ['About you', 'Your company', 'Review'];
return (<>
<Wizard.Stepper
  step={step}
  totalSteps={3}
  stepLabels={labels}
/>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
