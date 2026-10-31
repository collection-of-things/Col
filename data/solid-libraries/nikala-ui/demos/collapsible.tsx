import { formatCliCmd } from "@/lib/cli-formatter";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-solid";
import { createSignal } from "solid-js";
const importCode = `import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";`;
const heroCode = `<Collapsible class="w-full max-w-sm space-y-2 border border-border p-4 rounded-lg bg-card text-card-foreground">
  <div class="flex items-center justify-between gap-4">
    <h4 class="text-sm font-semibold">@magradze starred 3 repositories</h4>
    <CollapsibleTrigger class="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0">
      <ChevronsUpDown class="h-4 w-4" />
    </CollapsibleTrigger>
  </div>

  <div class="rounded-md border border-border px-4 py-2 font-mono text-sm shadow-2xs bg-muted/30">
    @nikala-ui/ui
  </div>

  <CollapsibleContent class="space-y-2">
    <div class="rounded-md border border-border px-4 py-2 font-mono text-sm shadow-2xs bg-muted/30">
      solid-js/solid
    </div>
    <div class="rounded-md border border-border px-4 py-2 font-mono text-sm shadow-2xs bg-muted/30">
      tailwindlabs/tailwindcss
    </div>
  </CollapsibleContent>
</Collapsible>`;
const defaultOpenCode = `<Collapsible defaultOpen={true} class="w-full max-w-sm space-y-2 border border-border p-4 rounded-lg">
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium">Developer Settings</span>
    <CollapsibleTrigger class="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent">
      <ChevronsUpDown class="h-4 w-4" />
    </CollapsibleTrigger>
  </div>

  <CollapsibleContent class="pt-2 text-xs text-muted-foreground space-y-1">
    <p>• Enable experimental reactivity flags</p>
    <p>• Enable Tailwind CSS v4 OKLCH color engine</p>
  </CollapsibleContent>
</Collapsible>`;
export default function Demo() {
const cliCmd = () => formatCliCmd("add collapsible");
const [isOpen, setIsOpen] = createSignal(false);
return <>
          <Collapsible open={isOpen()} onOpenChange={setIsOpen} class="w-full max-w-sm space-y-2 border border-border p-4 rounded-lg bg-card text-card-foreground">
            <div class="flex items-center justify-between gap-4">
              <h4 class="text-sm font-semibold">@magradze starred 3 repositories</h4>
              <CollapsibleTrigger class="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <ChevronsUpDown class={`h-4 w-4 transition-transform duration-200 ${isOpen() ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
            </div>

            <div class="rounded-md border border-border px-4 py-2 font-mono text-sm shadow-2xs bg-muted/30">
              @nikala-ui/ui
            </div>

            <CollapsibleContent class="space-y-2">
              <div class="rounded-md border border-border px-4 py-2 font-mono text-sm shadow-2xs bg-muted/30">
                solid-js/solid
              </div>
              <div class="rounded-md border border-border px-4 py-2 font-mono text-sm shadow-2xs bg-muted/30">
                tailwindlabs/tailwindcss
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>;
}
