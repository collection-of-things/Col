import { Popover } from '@torch-ui/solid/overlays'

import { Button } from '@torch-ui/solid/actions'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Popover>
  <Popover.Trigger as="button">
    <Button variant="outlined" size="sm">?? Fireball</Button>
  </Popover.Trigger>
  <Popover.Content>
    <div class="p-3 space-y-1">
      <p class="font-semibold text-sm text-ink-900">Fireball</p>
      <p class="text-xs text-ink-500">3rd-level evocation � Range: 150 ft</p>
      <p class="text-xs text-ink-600">8d6 fire damage in a 20-ft radius. DEX save DC 15.</p>
    </div>
  </Popover.Content>
</Popover>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
