import { createSignal } from 'solid-js'

import { FieldPicker } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const [value, setValue] = createSignal('')
const [columns, setColumns] = createSignal(['name', 'email'])

const options = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'role', label: 'Role' },
  { value: 'status', label: 'Status' },
  { value: 'created_at', label: 'Created At' },
];
return (<>
<FieldPicker
  label="Add column"
  options={options}
  value={value()}
  onValueChange={setValue}
  onAdd={() => {
    if (value()) setColumns((c) => [...c, value()])
    setValue('')
  }}
  addLabel="Add"
  addDisabled={!value()}
/>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
