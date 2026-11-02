import {
  ResizableGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
const importCode = `import {
  ResizableGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";`;
const defaultCode = `<ResizableGroup orientation="horizontal" class="h-56 max-w-md rounded-lg border">
  <ResizablePanel id="panel-1" initialSize={30} class="flex items-center justify-center p-6 bg-muted/20">
    <span class="font-medium text-sm">Panel One</span>
  </ResizablePanel>
  <ResizableHandle handleIndex={0} withHandle />
  <ResizablePanel id="panel-2" initialSize={70} class="flex items-center justify-center p-6 bg-muted/40">
    <span class="font-medium text-sm">Panel Two</span>
  </ResizablePanel>
</ResizableGroup>`;
const verticalCode = `<ResizableGroup orientation="vertical" class="h-64 max-w-md rounded-lg border">
  <ResizablePanel id="top" initialSize={50} class="flex items-center justify-center p-6 bg-muted/20">
    <span class="font-medium text-sm">Top Panel</span>
  </ResizablePanel>
  <ResizableHandle handleIndex={0} withHandle />
  <ResizablePanel id="bottom" initialSize={50} class="flex items-center justify-center p-6 bg-muted/40">
    <span class="font-medium text-sm">Bottom Panel</span>
  </ResizablePanel>
</ResizableGroup>`;
export default function Demo() {

return <>
          <ResizableGroup orientation="horizontal" class="h-56 max-w-md rounded-lg border">
            <ResizablePanel id="panel-1" initialSize={30} class="flex items-center justify-center p-6 bg-muted/20">
              <span class="font-medium text-sm">Sidebar (30%)</span>
            </ResizablePanel>
            <ResizableHandle handleIndex={0} withHandle />
            <ResizablePanel id="panel-2" initialSize={70} class="flex items-center justify-center p-6 bg-muted/40">
              <span class="font-medium text-sm">Content (70%)</span>
            </ResizablePanel>
          </ResizableGroup>
        </>;
}
