import { Chart } from '@torch-ui/solid/charts'



import { render } from "solid-js/web";
function Example() {

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    { label: 'Gold Earned', data: [12, 19, 8, 15, 22, 18], borderColor: '#0ea5e9' },
    { label: 'Gold Spent', data: [8, 14, 10, 12, 16, 14], borderColor: '#f43f5e' },
  ],
};
return (<>
<Chart type="line" data={data} class="h-64" />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
