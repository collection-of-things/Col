import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverCloseButton, PopoverArrow } from "@/components/ui/popover";
const importCode = `import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverCloseButton,
  PopoverArrow,
} from "@/components/ui/popover";`;
const defaultCode = `<Popover placement="bottom">
  <PopoverTrigger as={Button} variant="outline">Open Popover</PopoverTrigger>
  <PopoverContent class="w-80">
    <PopoverArrow />
    <PopoverCloseButton />
    <div class="grid gap-4">
      <div class="space-y-2">
        <PopoverTitle>Dimensions</PopoverTitle>
        <PopoverDescription>Set the width and max-height for the layer.</PopoverDescription>
      </div>
      <div class="grid gap-2">
        <div class="grid grid-cols-3 items-center gap-4">
          <Label for="width">Width</Label>
          <Input id="width" value="100%" class="col-span-2 h-8" />
        </div>
        <div class="grid grid-cols-3 items-center gap-4">
          <Label for="height">Height</Label>
          <Input id="height" value="25px" class="col-span-2 h-8" />
        </div>
      </div>
    </div>
  </PopoverContent>
</Popover>`;
const positionsCode = `<div class="flex flex-wrap gap-4">
  <Popover placement="top">
    <PopoverTrigger as={Button} variant="outline">Top</PopoverTrigger>
    <PopoverContent class="w-48"><PopoverArrow /><p class="text-sm">Top Placement</p></PopoverContent>
  </Popover>

  <Popover placement="right">
    <PopoverTrigger as={Button} variant="outline">Right</PopoverTrigger>
    <PopoverContent class="w-48"><PopoverArrow /><p class="text-sm">Right Placement</p></PopoverContent>
  </Popover>

  <Popover placement="bottom">
    <PopoverTrigger as={Button} variant="outline">Bottom</PopoverTrigger>
    <PopoverContent class="w-48"><PopoverArrow /><p class="text-sm">Bottom Placement</p></PopoverContent>
  </Popover>

  <Popover placement="left">
    <PopoverTrigger as={Button} variant="outline">Left</PopoverTrigger>
    <PopoverContent class="w-48"><PopoverArrow /><p class="text-sm">Left Placement</p></PopoverContent>
  </Popover>
</div>`;
export default function Demo() {

return <>
          <Popover placement="bottom">
            <PopoverTrigger as={Button} variant="outline">
              Open Popover
            </PopoverTrigger>
            <PopoverContent class="w-80">
              <PopoverArrow />
              <PopoverCloseButton />
              <div class="grid gap-4">
                <div class="space-y-2">
                  <PopoverTitle>Dimensions</PopoverTitle>
                  <PopoverDescription>
                    Set the width and max-height for the layer.
                  </PopoverDescription>
                </div>
                <div class="grid gap-2">
                  <div class="grid grid-cols-3 items-center gap-4">
                    <Label for="demo-width">Width</Label>
                    <Input id="demo-width" value="100%" class="col-span-2 h-8" />
                  </div>
                  <div class="grid grid-cols-3 items-center gap-4">
                    <Label for="demo-height">Height</Label>
                    <Input id="demo-height" value="25px" class="col-span-2 h-8" />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </>;
}
