import { render } from "solid-js/web";
import { createSignal } from "solid-js";
import { Button } from "@torch-ui/solid/actions";
function Example() {
  const [pressed, setPressed] = createSignal(false);
  return <Button pressed={pressed()} onValueChange={setPressed} variant="outlined">{pressed() ? "Selected" : "Select"}</Button>;
}
export default function mount(target: HTMLElement) { return render(() => <Example />, target); }
