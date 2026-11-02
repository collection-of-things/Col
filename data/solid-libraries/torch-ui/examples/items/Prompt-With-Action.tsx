import { PromptWithAction } from '@torch-ui/solid/layout'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<PromptWithAction
  prompt="Don't have an account?"
  actionLabel="Sign up"
  href="/register"
/>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
