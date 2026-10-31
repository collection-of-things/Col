import { Switch } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<div class="flex flex-wrap items-center gap-6">
  <Switch defaultChecked label="On" />
  <Switch label="Off" />
  <Switch disabled label="Disabled" />
  <Switch disabled defaultChecked label="Disabled on" />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
