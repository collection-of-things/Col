import { Sidebar } from '@torch-ui/solid/navigation'

import LayoutDashboard from 'lucide-solid/icons/layout-dashboard';
import Users from 'lucide-solid/icons/users';
import Settings from 'lucide-solid/icons/settings';



import { render } from "solid-js/web";
function Example() {

const items = [
  { key: 'keep', label: 'Keep', icon: <LayoutDashboard class="h-5 w-5" />, active: true, href: '/keep' },
  { key: 'adventurers', label: 'Adventurers', icon: <Users class="h-5 w-5" />, href: '/adventurers' },
  { key: 'arcana', label: 'Arcana', icon: <Settings class="h-5 w-5" />, href: '/arcana' },
];
return (<>
<Sidebar items={items} title="The Keep" />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
