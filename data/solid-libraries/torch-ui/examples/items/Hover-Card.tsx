import { HoverCard } from '@torch-ui/solid/overlays'

import { Avatar } from '@torch-ui/solid/data-display'

import Sword from 'lucide-solid/icons/sword';



import { render } from "solid-js/web";
function Example() {

;
return (<>
<HoverCard openDelay={200} closeDelay={100}>
  <HoverCard.Trigger as="a" href="#" class="font-medium text-primary-500 hover:text-primary-600 hover:underline underline-offset-2">
    @aldric
  </HoverCard.Trigger>
  <HoverCard.Content class="w-72">
    <HoverCard.Header>
      <div class="flex items-start justify-between gap-3">
        <Avatar name="Aldric Stonehammer" size="lg" />
        <button class="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-surface-overlay">
          Recruit
        </button>
      </div>
      <div class="mt-3">
        <p class="font-semibold text-ink-900">Aldric Stonehammer</p>
        <p class="text-sm text-ink-500">Paladin of the Oath of Devotion</p>
      </div>
    </HoverCard.Header>
    <HoverCard.Body class="pt-0">
      <p class="text-sm text-ink-600">Dwarven paladin from Ironspire. Sworn to protect the innocent. Wields a Flame Tongue longsword.</p>
      <div class="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
        <Sword class="h-4 w-4" />
        <span>Level 7 · AC 18 · HP 68</span>
      </div>
    </HoverCard.Body>
    <HoverCard.Separator />
    <HoverCard.Footer>
      <div class="flex gap-4 text-xs">
        <div><span class="font-semibold text-ink-900">12</span><span class="ml-1 text-ink-500">Sessions</span></div>
        <div><span class="font-semibold text-ink-900">847</span><span class="ml-1 text-ink-500">Kills</span></div>
      </div>
    </HoverCard.Footer>
  </HoverCard.Content>
</HoverCard>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
