import { Image } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Image
  src="https://picsum.photos/seed/torch/600/400"
  alt="Sample landscape"
/>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
