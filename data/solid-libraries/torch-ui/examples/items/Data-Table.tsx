import { DataTable, type ColumnDef } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {
const items = [{name:'Caelan Torchward', role:'Adventurer', status:'Active'}, {name:'Lyra Swiftfoot', role:'Ranger', status:'Active'}];
const columns: ColumnDef<Row>[] = [
  { id: 'name', header: 'Name', cell: (row) => row.name },
  { id: 'role', header: 'Role', cell: (row) => row.role },
  { id: 'status', header: 'Status', cell: (row) => row.status },
];
return (<>
<DataTable hideHeader items={items} columns={columns} emptyMessage="No rows" />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
