import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Caelan Torchward</TableCell>
      <TableCell>Fighter</TableCell>
      <TableCell>Ready</TableCell>
    </TableRow>
    ...
  </TableBody>
</Table>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
