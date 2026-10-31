import { createSignal } from "solid-js";
import {
  Slider,
  SliderTrack,
  SliderFill,
  SliderThumb,
  SliderLabel,
  SliderValueLabel,
} from "@/components/ui/slider";
const importCode = `import {
  Slider,
  SliderTrack,
  SliderFill,
  SliderThumb,
  SliderLabel,
  SliderValueLabel,
} from "@/components/ui/slider";`;
export default function Demo() {
const [singleValue, setSingleValue] = createSignal([40]);
const [rangeValue, setRangeValue] = createSignal([20, 80]);
const [stepValue, setStepValue] = createSignal([50]);
const [vertValue, setVertValue] = createSignal([60]);
return <>
          <div class="w-full max-w-sm py-4">
            <Slider value={singleValue()} onChange={setSingleValue}>
              <div class="flex items-center justify-between">
                <SliderLabel>Volume</SliderLabel>
                <SliderValueLabel />
              </div>
              <SliderTrack>
                <SliderThumb />
              </SliderTrack>
            </Slider>
          </div>
        </>;
}
