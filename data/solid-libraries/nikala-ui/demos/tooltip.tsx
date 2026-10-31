import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipArrow } from "@/components/ui/tooltip";
const importCode = `import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";`;
const defaultCode = `<Tooltip>
  <TooltipTrigger as={Button} variant="outline">Hover Me</TooltipTrigger>
  <TooltipContent>
    Add to bookmark list
  </TooltipContent>
</Tooltip>`;
const placementCode = `<div class="flex items-center gap-4">
  <Tooltip placement="top">
    <TooltipTrigger as={Button} variant="outline">Top</TooltipTrigger>
    <TooltipContent>Top tooltip</TooltipContent>
  </Tooltip>
  <Tooltip placement="bottom">
    <TooltipTrigger as={Button} variant="outline">Bottom</TooltipTrigger>
    <TooltipContent>Bottom tooltip</TooltipContent>
  </Tooltip>
  <Tooltip placement="left">
    <TooltipTrigger as={Button} variant="outline">Left</TooltipTrigger>
    <TooltipContent>Left tooltip</TooltipContent>
  </Tooltip>
  <Tooltip placement="right">
    <TooltipTrigger as={Button} variant="outline">Right</TooltipTrigger>
    <TooltipContent>Right tooltip</TooltipContent>
  </Tooltip>
</div>`;
export default function Demo() {

return <>
          <Tooltip>
            <TooltipTrigger as={Button} variant="outline">
              Hover Me
            </TooltipTrigger>
            <TooltipContent>
              <TooltipArrow />
              <span>Add to bookmark list</span>
            </TooltipContent>
          </Tooltip>
        </>;
}
