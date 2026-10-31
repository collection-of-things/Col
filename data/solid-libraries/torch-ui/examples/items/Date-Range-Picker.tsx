import { createSignal } from 'solid-js'

import { DateRangePicker } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const [start, setStart] = createSignal('')
const [end, setEnd] = createSignal('');
return (<>
<DateRangePicker
  label="Campaign window"
  start={start()}
  end={end()}
  onValueChange={(s, e) => { setStart(s); setEnd(e) }}
/>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
