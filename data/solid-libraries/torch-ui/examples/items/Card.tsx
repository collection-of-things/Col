import { Card } from '@torch-ui/solid/layout'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Card>
  <Card.Body>
    <h3 class="text-lg font-semibold text-ink-900">The Northern Pass</h3>
    <p class="mt-1 text-sm text-ink-600">Due by next full moon</p>
    <p class="mt-2 text-sm text-ink-500">2 of 5 objectives complete</p>
  </Card.Body>
</Card>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
