import { DataTable, type ColumnDef } from '@torch-ui/solid/data-display'
import { render } from 'solid-js/web'

type Row = { name: string; role: string; status: string }

const items: Row[] = [
  { name: 'Caelan Torchward', role: 'Fighter', status: 'Ready' },
  { name: 'Lyra Swiftfoot', role: 'Rogue', status: 'Ready' },
  { name: 'Grimshaw Stone', role: 'Cleric', status: 'Resting' },
]
const columns: ColumnDef<Row>[] = [
  { id: 'name', header: 'Name', cell: row => row.name },
  { id: 'role', header: 'Role', cell: row => row.role },
  { id: 'status', header: 'Status', cell: row => row.status },
]

export default function mount(target: HTMLElement) {
  return render(() => (
    <div class="w-full max-w-2xl">
      <DataTable items={items} columns={columns} emptyMessage="No rows" />
    </div>
  ), target)
}
