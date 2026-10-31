import { createSignal } from 'solid-js'

import { ReorderableList } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {
const reorderById = ids => ids.map(id => items().find(item => item.id === id)).filter(Boolean);
const [items, setItems] = createSignal<ReorderableListItem[]>([
  { id: '1', label: 'Fireball' },
  { id: '2', label: 'Ice Storm' },
  { id: '3', label: 'Lightning Bolt' },
]);
return (<>
<ReorderableList items={items()} onReorder={(ids) => setItems(reorderById(ids))} />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
