import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
const importCode = `import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";`;
const defaultCode = `<ButtonGroup aria-label="Document actions">
  <Button variant="default">Copy</Button>
  <Button variant="default">Share</Button>
  <Button variant="default">Export</Button>
</ButtonGroup>`;
const verticalCode = `<ButtonGroup orientation="vertical" aria-label="View options">
  <Button variant="default">List</Button>
  <Button variant="default">Grid</Button>
  <Button variant="default">Calendar</Button>
</ButtonGroup>`;
const variantsCode = `<ButtonGroup aria-label="File actions">
  <Button>Save</Button>
  <Button variant="secondary">Save as...</Button>
  <Button variant="default">Cancel</Button>
</ButtonGroup>`;
export default function Demo() {

return <>
          <ButtonGroup aria-label="Document actions">
            <Button variant="default">Copy</Button>
            <Button variant="default">Share</Button>
            <Button variant="default">Export</Button>
          </ButtonGroup>
        </>;
}
