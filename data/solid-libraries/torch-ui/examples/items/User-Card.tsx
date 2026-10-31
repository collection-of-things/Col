import { createSignal } from 'solid-js'

import { Card } from '@torch-ui/solid/layout'

import { Avatar, Tag } from '@torch-ui/solid/data-display'

import { Button } from '@torch-ui/solid/actions'

import Mail from 'lucide-solid/icons/mail';
import MapPin from 'lucide-solid/icons/map-pin';
import LinkIcon from 'lucide-solid/icons/link';



export function UserCard() {
  const [following, setFollowing] = createSignal(false)

  return (
    <Card class="w-full max-w-sm mx-auto">
      <Card.Body>
        <div class="flex items-start justify-between">
          <Avatar
            name="Lyra Swiftfoot"
            size="lg"
            shape="circle"
          />
          <Button
            variant={following() ? 'outlined' : 'primary'}
            size="sm"
            onClick={() => setFollowing((v) => !v)}
          >
            {following() ? 'Following' : 'Follow'}
          </Button>
        </div>

        <div class="mt-4">
          <h2 class="text-base font-semibold text-ink-900">Lyra Swiftfoot</h2>
          <p class="text-sm text-ink-500">Senior Rogue · Guild of Shadows</p>
        </div>

        <p class="mt-3 text-sm text-ink-600">
          Specialist in infiltration and intelligence gathering. Seven years on the front lines,
          three successful heists on the Crimson Keep.
        </p>

        <div class="mt-3 flex flex-wrap gap-1.5">
          <Tag size="sm" variant="neutral">Stealth</Tag>
          <Tag size="sm" variant="neutral">Lockpicking</Tag>
          <Tag size="sm" variant="neutral">Deception</Tag>
          <Tag size="sm" color="#7c3aed">Level 12</Tag>
        </div>

        <div class="mt-4 flex flex-col gap-1.5 text-sm text-ink-500">
          <span class="flex items-center gap-2">
            <MapPin class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Shadowfen, Northern Reach
          </span>
          <span class="flex items-center gap-2">
            <Mail class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            lyra@guild-of-shadows.org
          </span>
          <span class="flex items-center gap-2">
            <LinkIcon class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            guild-of-shadows.org/~lyra
          </span>
        </div>

        <div class="mt-4 grid grid-cols-3 divide-x divide-surface-border rounded-lg border border-surface-border text-center">
          <div class="py-3">
            <p class="text-sm font-semibold text-ink-900">142</p>
            <p class="text-xs text-ink-500">Missions</p>
          </div>
          <div class="py-3">
            <p class="text-sm font-semibold text-ink-900">98%</p>
            <p class="text-xs text-ink-500">Success</p>
          </div>
          <div class="py-3">
            <p class="text-sm font-semibold text-ink-900">2.4k</p>
            <p class="text-xs text-ink-500">Followers</p>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <UserCard />, target); }
