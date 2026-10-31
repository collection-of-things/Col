import { createSignal } from 'solid-js'

import { SearchPalette } from '@torch-ui/solid/overlays'

import { Button } from '@torch-ui/solid/actions'



import { render } from "solid-js/web";
function Example() {

const [open, setOpen] = createSignal(false)
const [query, setQuery] = createSignal('')

const ALL_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', category: 'pages' },
  { key: 'users', label: 'Users', category: 'pages' },
  { key: 'settings', label: 'Settings', category: 'pages' },
]

const groups = () => {
  const q = query().toLowerCase()
  const filtered = ALL_ITEMS.filter((i) => i.label.toLowerCase().includes(q))
  return [{ title: 'Pages', items: filtered }]
};
return (<>
<Button onClick={() => setOpen(true)}>Open Search</Button>

<SearchPalette
  open={open()}
  onOpenChange={setOpen}
  query={query()}
  onQueryChange={setQuery}
  groups={groups()}
  onSelect={(item) => {
    console.log('selected', item.key)
    setOpen(false)
  }}
/>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
