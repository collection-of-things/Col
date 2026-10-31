import { Chart } from '@torch-ui/solid/charts'



import { render } from "solid-js/web";
function Example() {

const data = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [{ label: 'Monsters Slain', data: [12, 19, 7, 15, 11], backgroundColor: '#8b5cf6' }],
};
return (<>
<Chart type="bar" data={data} class="h-64" />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
