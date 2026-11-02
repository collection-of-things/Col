import { MenuBar } from '@torch-ui/solid/navigation'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<MenuBar>
  <MenuBar.NavLink href="/keep">Keep</MenuBar.NavLink>

  <MenuBar.Menu>
    <MenuBar.Trigger>Wares</MenuBar.Trigger>
    <MenuBar.Content>
      <MenuBar.Item>All Wares</MenuBar.Item>
      <MenuBar.Item>Schools of Magic</MenuBar.Item>
      <MenuBar.Item>Armory</MenuBar.Item>
    </MenuBar.Content>
  </MenuBar.Menu>

  <MenuBar.Menu>
    <MenuBar.Trigger>Scrolls</MenuBar.Trigger>
    <MenuBar.Content>
      <MenuBar.Item>Trade Routes</MenuBar.Item>
      <MenuBar.Item>Divination</MenuBar.Item>
    </MenuBar.Content>
  </MenuBar.Menu>
</MenuBar>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
