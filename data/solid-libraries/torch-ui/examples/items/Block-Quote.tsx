import { BlockQuote } from '@torch-ui/solid/layout'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<BlockQuote>
  I didn't ask how big the orphanage was, I said I cast fireball.
</BlockQuote>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
