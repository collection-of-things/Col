import { Grid } from '@torch-ui/solid/layout'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Grid cols={2} gap="md">
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
  <div>6</div>
</Grid>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
