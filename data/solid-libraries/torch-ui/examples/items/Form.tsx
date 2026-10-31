import { Form } from '@torch-ui/solid/layout'

import { Input } from '@torch-ui/solid/forms'

import { Button } from '@torch-ui/solid/actions'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Form onSubmit={(e: Event) => e.preventDefault()} class="max-w-sm">
	<Input label="Name" placeholder="Your name" />
	<Input label="Email" type="email" placeholder="you@example.com" />
	<Button type="submit" variant="primary" fullWidth class="rounded-lg py-2.5 font-semibold">Submit</Button>
</Form>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
