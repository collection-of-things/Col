import { ContextMenu } from '@torch-ui/solid/overlays'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<ContextMenu>
  <ContextMenu.Trigger class="rounded border border-ink-200 p-4">
    Right-click a dungeon tile
  </ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item onSelect={() => {}}>Inspect Room</ContextMenu.Item>
    <ContextMenu.Item onSelect={() => {}}>Mark as Cleared</ContextMenu.Item>
    <ContextMenu.Item onSelect={() => {}}>Add Note</ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item onSelect={() => {}}>Remove Tile</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
