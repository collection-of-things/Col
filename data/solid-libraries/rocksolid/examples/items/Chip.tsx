import Chip from "rocksolidjs/Chip";
import { createSignal, Show } from "solid-js";

export default function Example() {
  const [first, setFirst] = createSignal(true);
  const [second, setSecond] = createSignal(true);
  return (
    <div class="flex gap-4">
      <Show when={first()}><Chip
        label="Chip 1"
        variant="solid"
        onDelete={() => setFirst(false)}
        onClick={(e) => {}}
        aria-label="Chip 1, press Delete to remove"
        onKeyDown={(event) => { if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); setFirst(false); } }}
      /></Show>
      <Show when={second()}><Chip
        label="Chip 2"
        onDelete={() => setSecond(false)}
        slotProps={{ deleteIcon: { role: "button", tabIndex: 0, "aria-label": "Remove Chip 2", onKeyDown: (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSecond(false); } } } }}
      /></Show>
    </div>
  );
}
