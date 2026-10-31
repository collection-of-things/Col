import { StatCard } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<StatCard
  label="Party gold"
  value="2,450 gp"
/>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
