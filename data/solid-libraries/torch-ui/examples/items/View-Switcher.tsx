import { createSignal } from 'solid-js';import { ViewSwitcher } from '@torch-ui/solid/navigation'



import { render } from "solid-js/web";
function Example() {
const [activeView, setActiveView] = createSignal('all');
const views = [
  { id: 'all', label: 'All Adventurers', count: 2451 },
  { id: 'active', label: 'Active Quests', count: 89, pinned: true },
  { id: 'recruits', label: 'My Recruits', count: 34 },
];
return (<>
<ViewSwitcher
  views={views}
  activeId={activeView()}
  onValueChange={(id) => setActiveView(id)}
/>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
