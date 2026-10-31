import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const importCode = `import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";`;
const defaultCode = `<Sheet>
  <SheetTrigger as={Button} variant="secondary">
    Open Right Sheet
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Edit Profile</SheetTitle>
      <SheetDescription>
        Make changes to your profile here. Click save when you're done.
      </SheetDescription>
    </SheetHeader>
    <div class="space-y-4 py-4">
      <div class="space-y-2">
        <Label for="name">Name</Label>
        <Input id="name" value="Niko Pirosmani" />
      </div>
      <div class="space-y-2">
        <Label for="username">Username</Label>
        <Input id="username" value="@pirosmani" />
      </div>
    </div>
    <SheetFooter>
      <SheetClose as={Button} variant="secondary">Cancel</SheetClose>
      <Button>Save changes</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>`;
const sidesCode = `<div class="grid grid-cols-2 gap-4">
  <Sheet>
    <SheetTrigger as={Button} variant="secondary">Top</SheetTrigger>
    <SheetContent side="top" class="h-1/2">
      <SheetHeader>
        <SheetTitle>Top Sheet</SheetTitle>
        <SheetDescription>Slides down from the top edge.</SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>

  <Sheet>
    <SheetTrigger as={Button} variant="secondary">Bottom</SheetTrigger>
    <SheetContent side="bottom" class="h-1/2">
      <SheetHeader>
        <SheetTitle>Bottom Sheet</SheetTitle>
        <SheetDescription>Slides up from the bottom edge.</SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>

  <Sheet>
    <SheetTrigger as={Button} variant="secondary">Left</SheetTrigger>
    <SheetContent side="left">
      <SheetHeader>
        <SheetTitle>Left Navigation</SheetTitle>
        <SheetDescription>Slides in from the left edge.</SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>

  <Sheet>
    <SheetTrigger as={Button} variant="secondary">Right</SheetTrigger>
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Right Drawer</SheetTitle>
        <SheetDescription>Slides in from the right edge.</SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>
</div>`;
export default function Demo() {

return <>
          <Sheet>
            <SheetTrigger as={Button} variant="secondary">
              Open Right Sheet
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Edit Profile</SheetTitle>
                <SheetDescription>
                  Make changes to your profile here. Click save when you're done.
                </SheetDescription>
              </SheetHeader>
              <div class="space-y-4 py-4">
                <div class="space-y-2">
                  <Label for="sheet-name">Name</Label>
                  <Input id="sheet-name" value="Niko Pirosmani" />
                </div>
                <div class="space-y-2">
                  <Label for="sheet-user">Username</Label>
                  <Input id="sheet-user" value="@pirosmani" />
                </div>
              </div>
              <SheetFooter>
                <SheetClose as={Button} variant="secondary">Cancel</SheetClose>
                <Button>Save changes</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </>;
}
