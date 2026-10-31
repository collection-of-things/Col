import { Tooltip } from '@torch-ui/solid/overlays'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Tooltip>
  <Tooltip.Trigger as="button" class="rounded-lg border px-3 py-1.5 text-sm">
    🔥 Fireball
  </Tooltip.Trigger>
  <Tooltip.Content>8d6 fire damage in a 20-ft radius. DEX save DC 15.</Tooltip.Content>
</Tooltip>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
