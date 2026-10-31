import { Code } from '@torch-ui/solid/typography'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<p>Use the <Code>variableName</Code> prop to pass a value.</p>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
