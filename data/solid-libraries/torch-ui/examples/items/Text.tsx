
import { render } from "solid-js/web";
function Example() {

;
return (<>
<p class="text-xs">Extra small (12px)</p>
<p class="text-sm">Small (14px)</p>
<p class="text-base">Base (16px)</p>
<p class="text-lg">Large (18px)</p>
<p class="text-xl">Extra large (20px)</p>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
