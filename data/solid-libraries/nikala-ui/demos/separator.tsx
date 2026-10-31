import { Separator } from "@/components/ui/separator";
const importCode = `import { Separator } from "@/components/ui/separator";`;
const defaultCode = `<div class="max-w-xs space-y-3">
  <div class="space-y-1">
    <h4 class="text-sm font-medium leading-none">Nikala UI</h4>
    <p class="text-xs text-muted-foreground">SolidJS & Tailwind CSS v4 component system.</p>
  </div>
  <Separator />
  <div class="flex h-5 items-center space-x-4 text-xs font-mono">
    <span>Docs</span>
    <Separator orientation="vertical" />
    <span>Components</span>
    <Separator orientation="vertical" />
    <span>Source</span>
  </div>
</div>`;
const verticalCode = `<div class="flex h-5 items-center space-x-4 text-sm font-medium">
  <span>Blog</span>
  <Separator orientation="vertical" />
  <span>Docs</span>
  <Separator orientation="vertical" />
  <span>Source</span>
</div>`;
export default function Demo() {

return <>
          <div class="max-w-xs space-y-3">
            <div class="space-y-1">
              <h4 class="text-sm font-medium leading-none">Nikala UI</h4>
              <p class="text-xs text-muted-foreground">SolidJS & Tailwind CSS v4 component system.</p>
            </div>
            <Separator />
            <div class="flex h-5 items-center space-x-4 text-xs font-mono">
              <span>Docs</span>
              <Separator orientation="vertical" />
              <span>Components</span>
              <Separator orientation="vertical" />
              <span>Source</span>
            </div>
          </div>
        </>;
}
