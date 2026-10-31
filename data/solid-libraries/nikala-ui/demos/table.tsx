import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { For, createSignal } from "solid-js";
import { MoreHorizontal, ArrowUpDown } from "lucide-solid";
const importCode = `import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";`;
const defaultCode = `<Table>
  <TableHeader>
    <TableRow>
      <TableHead class="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead class="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell class="font-medium font-mono">INV-001</TableCell>
      <TableCell><Badge variant="outline">Paid</Badge></TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell class="text-right font-mono">$250.00</TableCell>
    </TableRow>
    <TableRow>
      <TableCell class="font-medium font-mono">INV-002</TableCell>
      <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
      <TableCell>PayPal</TableCell>
      <TableCell class="text-right font-mono">$150.00</TableCell>
    </TableRow>
    <TableRow>
      <TableCell class="font-medium font-mono">INV-003</TableCell>
      <TableCell><Badge variant="destructive">Unpaid</Badge></TableCell>
      <TableCell>Bank Transfer</TableCell>
      <TableCell class="text-right font-mono">$350.00</TableCell>
    </TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={3}>Total</TableCell>
      <TableCell class="text-right font-mono font-bold">$750.00</TableCell>
    </TableRow>
  </TableFooter>
</Table>`;
const teamCode = `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Member</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Status</TableHead>
      <TableHead class="text-right">Action</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>
        <div class="flex items-center gap-3">
          <Avatar class="h-8 w-8">
            <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Niko" />
            <AvatarFallback>NP</AvatarFallback>
          </Avatar>
          <div class="flex flex-col">
            <span class="font-medium leading-none">Niko Pirosmani</span>
            <span class="text-xs text-muted-foreground">niko@nikala.dev</span>
          </div>
        </div>
      </TableCell>
      <TableCell>Lead Artist</TableCell>
      <TableCell><Badge variant="outline" class="text-emerald-500 border-emerald-500/30">Active</Badge></TableCell>
      <TableCell class="text-right">
        <Button variant="ghost" size="sm">Edit</Button>
      </TableCell>
    </TableRow>
    <TableRow>
      <TableCell>
        <div class="flex items-center gap-3">
          <Avatar class="h-8 w-8">
            <AvatarFallback>EK</AvatarFallback>
          </Avatar>
          <div class="flex flex-col">
            <span class="font-medium leading-none">Elene Kakabadze</span>
            <span class="text-xs text-muted-foreground">elene@nikala.dev</span>
          </div>
        </div>
      </TableCell>
      <TableCell>Designer</TableCell>
      <TableCell><Badge variant="secondary">Offline</Badge></TableCell>
      <TableCell class="text-right">
        <Button variant="ghost" size="sm">Edit</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>`;
const selectableCode = `const [selected, setSelected] = createSignal<string[]>(["INV-001"]);

<Table>
  <TableHeader>
    <TableRow>
      <TableHead class="w-12">
        <Checkbox />
      </TableHead>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead class="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow data-state={selected().includes("INV-001") ? "selected" : undefined}>
      <TableCell>
        <Checkbox checked={selected().includes("INV-001")} />
      </TableCell>
      <TableCell class="font-medium font-mono">INV-001</TableCell>
      <TableCell><Badge variant="outline">Paid</Badge></TableCell>
      <TableCell class="text-right font-mono">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>`;
const tanstackSnippet = `import { createSolidTable, getCoreRowModel, flexRender } from "@tanstack/solid-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

// Combine TanStack Table's headless logic with Nikala UI's pure JSX table components
const table = createSolidTable({
  data: data(),
  columns,
  getCoreRowModel: getCoreRowModel(),
});

return (
  <Table>
    <TableHeader>
      <For each={table.getHeaderGroups()}>
        {(headerGroup) => (
          <TableRow>
            <For each={headerGroup.headers}>
              {(header) => (
                <TableHead>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              )}
            </For>
          </TableRow>
        )}
      </For>
    </TableHeader>
    <TableBody>
      <For each={table.getRowModel().rows}>
        {(row) => (
          <TableRow>
            <For each={row.getVisibleCells()}>
              {(cell) => (
                <TableCell>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              )}
            </For>
          </TableRow>
        )}
      </For>
    </TableBody>
  </Table>
);`;
export default function Demo() {
const invoices = [
    { id: "INV-001", status: "Paid", variant: "outline" as const, method: "Credit Card", amount: "$250.00" },
    { id: "INV-002", status: "Pending", variant: "secondary" as const, method: "PayPal", amount: "$150.00" },
    { id: "INV-003", status: "Unpaid", variant: "destructive" as const, method: "Bank Transfer", amount: "$350.00" },
    { id: "INV-004", status: "Paid", variant: "outline" as const, method: "Credit Card", amount: "$450.00" },
    { id: "INV-005", status: "Paid", variant: "outline" as const, method: "Apple Pay", amount: "$550.00" },
  ];
const [selectedIds, setSelectedIds] = createSignal<string[]>(["INV-001", "INV-003"]);
const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
const toggleSelectAll = () => {
    if (selectedIds().length === invoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(invoices.map((inv) => inv.id));
    }
  };
return <>
          <div class="w-full max-w-2xl rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[100px]">Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead class="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <For each={invoices}>
                  {(invoice) => (
                    <TableRow>
                      <TableCell class="font-medium font-mono">{invoice.id}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.variant}>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell>{invoice.method}</TableCell>
                      <TableCell class="text-right font-mono">{invoice.amount}</TableCell>
                    </TableRow>
                  )}
                </For>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell class="text-right font-mono font-bold">$1,750.00</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </>;
}
