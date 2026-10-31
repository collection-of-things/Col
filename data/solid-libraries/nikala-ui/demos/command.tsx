import { createSignal } from "solid-js";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandFooter,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Calendar,
  Smile,
  Calculator,
  User,
  CreditCard,
  Settings,
  BookOpen,
  Terminal,
} from "lucide-solid";
const importCode = `import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandFooter,
} from "@/components/ui/command";`;
const inlineCode = `<Command class="max-w-md border border-border shadow-sm">
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty />
    <CommandGroup heading="Suggestions">
      <CommandItem title="Calendar" icon={Calendar} shortcut="⌘P" />
      <CommandItem title="Search Emoji" icon={Smile} />
      <CommandItem title="Calculator" icon={Calculator} />
    </CommandGroup>
    <CommandGroup heading="Settings">
      <CommandItem title="Profile" icon={User} />
      <CommandItem title="Billing" icon={CreditCard} />
      <CommandItem title="Settings" icon={Settings} shortcut="⌘S" />
    </CommandGroup>
  </CommandList>
  <CommandFooter />
</Command>`;
const modalCode = `const [open, setOpen] = createSignal(false);

return (
  <>
    <Button onClick={() => setOpen(true)} variant="outline" size="sm" class="gap-2">
      <span>Search documentation...</span>
      <KbdGroup>
        <Kbd size="sm">⌘</Kbd>
        <Kbd size="sm">K</Kbd>
      </KbdGroup>
    </Button>

    <CommandDialog open={open()} onOpenChange={setOpen} enableHotkey={true}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty />
        <CommandGroup heading="Documentation">
          <CommandItem
            title="Introduction"
            href="/docs"
            icon={BookOpen}
            onSelect={() => setOpen(false)}
          />
          <CommandItem
            title="CLI Reference"
            href="/docs/cli"
            icon={Terminal}
            onSelect={() => setOpen(false)}
          />
        </CommandGroup>
      </CommandList>
      <CommandFooter />
    </CommandDialog>
  </>
);`;
export default function Demo() {
const [dialogOpen, setDialogOpen] = createSignal(false);
return <>
          <div class="w-full max-w-md">
            <Command class="border border-border shadow-md">
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty />
                <CommandGroup heading="Suggestions">
                  <CommandItem title="Calendar" icon={Calendar} shortcut="⌘P" />
                  <CommandItem title="Search Emoji" icon={Smile} />
                  <CommandItem title="Calculator" icon={Calculator} />
                </CommandGroup>
                <CommandGroup heading="Settings">
                  <CommandItem title="Profile" icon={User} />
                  <CommandItem title="Billing" icon={CreditCard} />
                  <CommandItem title="Settings" icon={Settings} shortcut="⌘S" />
                </CommandGroup>
              </CommandList>
              <CommandFooter />
            </Command>
          </div>
        </>;
}
