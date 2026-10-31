import { TreeView } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

const nodes = [
  {
    id: 'dungeon',
    label: 'The Ashwood Dungeon',
    children: [
      { id: 'floor1', label: 'Floor 1 — Entry Hall', children: [
        { id: 'guard-room', label: 'Guard Room' },
        { id: 'storage', label: 'Storage Chamber' },
      ]},
      { id: 'floor2', label: 'Floor 2 — The Catacombs' },
    ],
  },
];
return (<>
<TreeView nodes={nodes} />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
