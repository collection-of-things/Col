import { Toggle, ToggleGroup } from "@/components/ui/toggle";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-solid";
import { createSignal } from "solid-js";
const importCode = `import { Toggle, ToggleGroup } from "@/components/ui/toggle";`;
const defaultCode = `<Toggle aria-label="Toggle italic">
  <Italic class="h-4 w-4" />
</Toggle>`;
const outlineCode = `<Toggle variant="outline" aria-label="Toggle italic">
  <Italic class="h-4 w-4" />
</Toggle>`;
const groupCode = `<ToggleGroup>
  <Toggle aria-label="Toggle bold">
    <Bold class="h-4 w-4" />
  </Toggle>
  <Toggle aria-label="Toggle italic">
    <Italic class="h-4 w-4" />
  </Toggle>
  <Toggle aria-label="Toggle underline">
    <Underline class="h-4 w-4" />
  </Toggle>
</ToggleGroup>`;
export default function Demo() {
const [isBold, setIsBold] = createSignal(false);
return <>
          <div class="flex items-center gap-4">
            <Toggle
              pressed={isBold()}
              onPressedChange={setIsBold}
              aria-label="Toggle italic"
            >
              <Italic class="h-4 w-4" />
            </Toggle>
          </div>
        </>;
}
