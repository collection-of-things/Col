import { PageHeading } from '@torch-ui/solid/layout'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<PageHeading
  title="Dashboard"
  description="Overview of your workspace activity and metrics."
/>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
