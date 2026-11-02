import { createSignal } from "solid-js";
import { Progress } from "@/components/ui/progress";
const importCode = `import { Progress } from "@/components/ui/progress";`;
const basicUsageCode = `<Progress value={60} />`;
const labeledCode = `<Progress value={75} label="Uploading file..." />`;
export function ProgressDemo() {
  const [value, setValue] = createSignal(45);

  return (
    <div class="w-full max-w-sm space-y-6">
      <Progress value={value()} label="Task Progress" />

      <div class="flex items-center gap-2">
        <button
          onClick={() => setValue((v) => Math.max(0, v - 15))}
          class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          -15%
        </button>
        <button
          onClick={() => setValue((v) => Math.min(100, v + 15))}
          class="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          +15%
        </button>
      </div>
    </div>
  );
}
export default function Demo() {

return <>
          <ProgressDemo />
        </>;
}
