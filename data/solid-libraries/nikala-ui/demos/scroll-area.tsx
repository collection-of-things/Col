import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
const importCode = `import { ScrollArea } from "@/components/ui/scroll-area";`;
const defaultCode = `<ScrollArea class="h-72 w-48 rounded-md border p-4">
  <div class="space-y-2">
    <h4 class="text-sm font-medium leading-none">Tags</h4>
    <p class="text-xs text-muted-foreground">List of generated tags</p>
  </div>
  <Separator class="my-4" />
  <div class="space-y-1">
    {Array.from({ length: 50 }).map((_, i) => (
      <div class="text-sm">v1.0.0-beta.\${i + 1}</div>
    ))}
  </div>
</ScrollArea>`;
const horizontalCode = `<ScrollArea orientation="horizontal" class="w-96 whitespace-nowrap rounded-md border p-4">
  <div class="flex w-max space-x-4">
    {Array.from({ length: 20 }).map((_, i) => (
      <div class="h-24 w-24 shrink-0 rounded-md border border-border bg-muted/40 flex items-center justify-center font-medium text-xs">
        Card \${i + 1}
      </div>
    ))}
  </div>
</ScrollArea>`;
export default function Demo() {

return <>
          <ScrollArea class="h-72 w-48 rounded-md border p-4">
            <div class="space-y-2">
              <h4 class="text-sm font-medium leading-none">Tags</h4>
              <p class="text-xs text-muted-foreground">List of generated tags</p>
            </div>
            <Separator class="my-4" />
            <div class="space-y-2">
              {Array.from({ length: 30 }).map((_, i) => (
                <div class="text-sm text-foreground hover:text-primary transition-colors cursor-pointer">
                  v1.0.0-beta.{i + 1}
                </div>
              ))}
            </div>
          </ScrollArea>
        </>;
}
