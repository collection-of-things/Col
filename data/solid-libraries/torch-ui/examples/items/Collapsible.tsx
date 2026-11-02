import { Collapsible } from '@torch-ui/solid/layout'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Collapsible>
  <Collapsible.Trigger>Toggle to show content</Collapsible.Trigger>
  <Collapsible.Content>
    <p class="p-4 text-sm text-ink-700">Hidden content shown when expanded.</p>
  </Collapsible.Content>
</Collapsible>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
