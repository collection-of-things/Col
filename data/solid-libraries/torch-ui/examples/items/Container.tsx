import { Container } from '@torch-ui/solid/layout'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Container>
  <p>Page content is centered with max-width and horizontal padding.</p>
</Container>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
