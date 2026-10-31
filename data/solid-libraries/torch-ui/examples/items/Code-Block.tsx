import { CodeBlock } from '@torch-ui/solid/layout'



import { render } from "solid-js/web";
function Example() {

const code = `function hello() {
  return "Hello, world!"
}`;
return (<>
<div class="w-full">
  <CodeBlock content={code} language="javascript" />
</div>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
