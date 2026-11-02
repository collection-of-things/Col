import { ColorSwatch } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<div class="flex flex-wrap items-center gap-3">
  <ColorSwatch value="#3b82f6" class="h-10 w-10" />
  <ColorSwatch value="#22c55e" class="h-10 w-10" />
  <ColorSwatch value="#ef4444" class="h-10 w-10" />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
