import { createSignal } from 'solid-js';import { Tabs } from '@torch-ui/solid/navigation'



import { render } from "solid-js/web";
function Example() {
const [activeTab, setActiveTab] = createSignal('quests');
const tabs = [
  { id: 'quests', label: 'Quests' },
  { id: 'party', label: 'Party' },
  { id: 'spellbook', label: 'Spellbook' },
];
return (<>
<Tabs
  tabs={tabs}
  defaultValue="quests"
  onValueChange={(id) => setActiveTab(id)}
/>
{/* Render content based on activeTab */}
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
