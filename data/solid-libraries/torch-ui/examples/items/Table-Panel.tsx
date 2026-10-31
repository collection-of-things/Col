import { TablePanel } from '@torch-ui/solid/layout'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<TablePanel header={<h2 class="text-lg font-semibold text-ink-900">Panel title</h2>}>
  <p class="text-sm text-ink-600">Panel body. Put your table or other content here.</p>
</TablePanel>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
