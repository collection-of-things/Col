import { Inline } from '@torch-ui/solid/layout'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Inline>
  <div class="rounded-md border border-surface-border bg-surface-raised px-2 py-1 text-xs font-medium text-ink-700">Left</div>
  <div class="rounded-md border border-surface-border bg-surface-raised px-2 py-1 text-xs font-medium text-ink-700">Right</div>
</Inline>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
