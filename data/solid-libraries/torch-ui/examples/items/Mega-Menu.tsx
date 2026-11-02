import ShoppingCart from 'lucide-solid/icons/shopping-cart'
import Package from 'lucide-solid/icons/package'
import ChartBar from 'lucide-solid/icons/chart-bar'
import Globe from 'lucide-solid/icons/globe'
import Users from 'lucide-solid/icons/users'
import Settings from 'lucide-solid/icons/settings'
import LayoutDashboard from 'lucide-solid/icons/layout-dashboard'
import FileText from 'lucide-solid/icons/file-text'
import { MegaMenu } from '@torch-ui/solid/navigation'
import { render } from 'solid-js/web'

function Example() {
  return (
    <div class="overflow-visible rounded-xl border border-surface-border bg-surface-raised px-4 w-full">
      <div class="flex h-14 items-center gap-2">
        <a href="#" class="mr-2 flex shrink-0 items-center gap-2 text-sm font-bold text-ink-900">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500"><span class="text-xs font-bold text-white">T</span></div>
          TorchUI
        </a>
        <MegaMenu class="flex-1 w-full">
          <MegaMenu.Menu>
            <MegaMenu.Trigger>Wares</MegaMenu.Trigger>
            <MegaMenu.Content>
              <MegaMenu.Panel columns={3}>
                <MegaMenu.Column>
                  <MegaMenu.Section label="Marketplace">
                    <MegaMenu.Item href="#" icon={<ShoppingCart class="h-4 w-4" />} label="Trading Post" description="Browse all wares" />
                    <MegaMenu.Item href="#" icon={<Package class="h-4 w-4" />} label="Tome of Goods" description="Index of all items" />
                  </MegaMenu.Section>
                </MegaMenu.Column>
                <MegaMenu.Column>
                  <MegaMenu.Section label="Divination">
                    <MegaMenu.Item href="#" icon={<ChartBar class="h-4 w-4" />} label="Scrolls" description="Trade route performance" />
                    <MegaMenu.Item href="#" icon={<Globe class="h-4 w-4" />} label="Territories" description="Regional overview" />
                  </MegaMenu.Section>
                </MegaMenu.Column>
                <MegaMenu.Column>
                  <MegaMenu.Section label="Guild">
                    <MegaMenu.Item href="#" icon={<Users class="h-4 w-4" />} label="Party" description="Manage party access" />
                    <MegaMenu.Item href="#" icon={<Settings class="h-4 w-4" />} label="Arcana" description="Realm configuration" />
                  </MegaMenu.Section>
                </MegaMenu.Column>
              </MegaMenu.Panel>
            </MegaMenu.Content>
          </MegaMenu.Menu>
          <MegaMenu.Menu>
            <MegaMenu.Trigger>Paths</MegaMenu.Trigger>
            <MegaMenu.Content>
              <MegaMenu.Panel columns={2}>
                <MegaMenu.Column>
                  <MegaMenu.Section label="By Role">
                    <MegaMenu.Item href="#" icon={<LayoutDashboard class="h-4 w-4" />} label="War Room" description="Track battle metrics" />
                    <MegaMenu.Item href="#" icon={<FileText class="h-4 w-4" />} label="Chronicles" description="Write chronicles" />
                  </MegaMenu.Section>
                </MegaMenu.Column>
                <MegaMenu.Column>
                  <MegaMenu.Section label="By Class">
                    <MegaMenu.Item href="#" icon={<Users class="h-4 w-4" />} label="Merchants" description="For merchant guilds" />
                    <MegaMenu.Item href="#" icon={<ChartBar class="h-4 w-4" />} label="Diviners" description="For those who scry" />
                  </MegaMenu.Section>
                </MegaMenu.Column>
              </MegaMenu.Panel>
            </MegaMenu.Content>
          </MegaMenu.Menu>
        </MegaMenu>
        <div class="ml-auto flex shrink-0 items-center gap-2">
          <a href="#" class="px-3 py-1.5 text-sm text-ink-500 transition-colors hover:text-ink-900">Sign in</a>
          <a href="#" class="rounded-lg bg-primary-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-600">Get started</a>
        </div>
      </div>
    </div>
  )
}

export default function mount(target) { return render(() => <Example />, target) }
