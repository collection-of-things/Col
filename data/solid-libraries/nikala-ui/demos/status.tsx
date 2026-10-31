import { Status } from "@/components/ui/status";
const importCode = `import { Status } from "@/components/ui/status";`;
const defaultCode = `<Status variant="success">Operational</Status>`;
const variantsCode = `<div class="flex flex-wrap items-center gap-4">
  <Status variant="success">Operational</Status>
  <Status variant="warning">Pending</Status>
  <Status variant="error">Offline</Status>
  <Status variant="info">In progress</Status>
  <Status variant="neutral">Draft</Status>
</div>`;
const sizesCode = `<div class="flex items-center gap-4">
  <Status size="sm" variant="success">Online</Status>
  <Status variant="success">Online</Status>
</div>`;
const animatedCode = `<div class="flex flex-wrap items-center gap-4">
  <Status variant="success" animation="pulse">Syncing</Status>
  <Status variant="info" animation="ping">Deploying</Status>
  <Status variant="warning" bordered>Needs attention</Status>
</div>`;
export default function Demo() {

return <>
          <Status variant="success">Operational</Status>
        </>;
}
