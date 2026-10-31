import ShoppingCart from 'lucide-solid/icons/shopping-cart';
import Package from 'lucide-solid/icons/package';
import ChartBar from 'lucide-solid/icons/chart-bar';import { MegaMenu } from '@torch-ui/solid/navigation'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<MegaMenu class="flex-1 w-full">
  <MegaMenu.Menu>
    <MegaMenu.Trigger>Wares</MegaMenu.Trigger>
    <MegaMenu.Content>
      <MegaMenu.Panel columns={3}>
        <MegaMenu.Column>
          <MegaMenu.Section title="Marketplace">
            <MegaMenu.Item href="/trading-post" icon={<ShoppingCart />} description="Browse all wares">
              Trading Post
            </MegaMenu.Item>
            <MegaMenu.Item href="/tome" icon={<Package />} description="Index of all items">
              Tome of Goods
            </MegaMenu.Item>
          </MegaMenu.Section>
        </MegaMenu.Column>
        <MegaMenu.Column>
          <MegaMenu.Section title="Divination">
            <MegaMenu.Item href="/scrolls" icon={<ChartBar />} description="Trade route performance">
              Scrolls
            </MegaMenu.Item>
          </MegaMenu.Section>
        </MegaMenu.Column>
      </MegaMenu.Panel>
    </MegaMenu.Content>
  </MegaMenu.Menu>
</MegaMenu>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
