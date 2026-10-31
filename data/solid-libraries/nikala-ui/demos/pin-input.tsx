import { createSignal, Index } from "solid-js";
import {
  PinInput,
  PinInputInput,
  PinInputLabel,
} from "@/components/ui/pin-input";
const importCode = `import {
  PinInput,
  PinInputInput,
  PinInputLabel,
} from "@/components/ui/pin-input";`;
export default function Demo() {
const [value, setValue] = createSignal("");
const [alphaValue, setAlphaValue] = createSignal("");
const [maskedValue, setMaskedValue] = createSignal("");
return <>
          <div class="flex flex-col items-start gap-2 py-4">
            <PinInput type="numeric" length={4} value={value()} onValueChange={setValue} class="flex-col items-start gap-2">
              <PinInputLabel>Enter 4-Digit SMS Code</PinInputLabel>
              <div class="flex items-center gap-2">
                <Index each={[0, 1, 2, 3]}>
                  {(index) => <PinInputInput index={index()} />}
                </Index>
              </div>
            </PinInput>
            <p class="text-xs text-muted-foreground font-mono mt-1">
              Current Code: <span class="text-foreground font-bold">{value() || "____"}</span>
            </p>
          </div>
        </>;
}
