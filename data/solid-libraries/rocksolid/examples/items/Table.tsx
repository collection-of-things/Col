import Table from "rocksolidjs/Table";
import TableBody from "rocksolidjs/TableBody";
import TableCell from "rocksolidjs/TableCell";
import TableHead from "rocksolidjs/TableHead";
import TableRow from "rocksolidjs/TableRow";

const users = [
  {
    name: "Olivia Martin",
    email: "olivia@example.com",
    role: "Admin",
    status: "Active",
    joined: "Jan 12, 2025",
  },
  {
    name: "Jackson Lee",
    email: "jackson@example.com",
    role: "Member",
    status: "Active",
    joined: "Feb 08, 2025",
  },
  {
    name: "Sophia Brown",
    email: "sophia@example.com",
    role: "Member",
    status: "Inactive",
    joined: "Mar 21, 2025",
  },
];

export default function Example() {
  return (
    <div class="w-full overflow-x-auto">
      <Table class="min-w-200">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Joined</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>{user.joined}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
