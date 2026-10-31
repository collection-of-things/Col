import { render } from "solid-js/web";
import { createSignal } from "solid-js";
import Button from "rocksolidjs/Button";

function Example() {
  const [count, setCount] = createSignal(0);
  return <Button onClick={() => setCount(count() + 1)}>Clicked {count()} times</Button>;
}

export default function mount(target: HTMLElement) { return render(() => <Example />, target); }
