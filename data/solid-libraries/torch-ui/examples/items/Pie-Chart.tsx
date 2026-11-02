import { Chart } from '@torch-ui/solid/charts'



import { render } from "solid-js/web";
function Example() {

const data = {
  labels: ['Warriors', 'Mages', 'Rogues', 'Clerics'],
  datasets: [{
    label: 'Guild Roster',
    data: [30, 25, 25, 20],
    backgroundColor: ['#0ea5e9', '#22c55e', '#eab308', '#f43f5e'],
  }],
};
return (<>
<Chart type="doughnut" data={data} class="h-64" />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
