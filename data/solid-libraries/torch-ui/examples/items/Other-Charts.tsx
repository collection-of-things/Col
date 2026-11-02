import { Chart } from '@torch-ui/solid/charts'



import { render } from "solid-js/web";
function Example() {

const data = {
  labels: ['Speed', 'Strength', 'Defense', 'Stamina', 'Arcana'],
  datasets: [
    { label: 'Fighter', data: [85, 70, 90, 75, 80], borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.2)' },
    { label: 'Wizard', data: [70, 85, 65, 90, 75], borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)' },
  ],
};
return (<>
<Chart type="radar" data={data} class="h-80" />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
