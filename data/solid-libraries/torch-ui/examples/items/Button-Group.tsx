import { Button, ButtonGroup } from '@torch-ui/solid/actions'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<ButtonGroup variant="outlined">
  <Button variant="outlined" disableElevation>One</Button>
  <Button variant="outlined" disableElevation>Two</Button>
  <Button variant="outlined" disableElevation>Three</Button>
</ButtonGroup>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
