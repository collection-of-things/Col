import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const importCode = `import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";`;
const defaultCode = `<Dialog>
  <DialogTrigger as={Button} variant="outline">
    Edit Profile
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you are done.
      </DialogDescription>
    </DialogHeader>
    <div class="space-y-4 py-2">
      <div class="space-y-2">
        <Label for="name">Name</Label>
        <Input id="name" value="Niko Pirosmani" />
      </div>
      <div class="space-y-2">
        <Label for="username">Username</Label>
        <Input id="username" value="@pirosmani" />
      </div>
    </div>
    <DialogFooter>
      <DialogClose as={Button} variant="outline">Cancel</DialogClose>
      <Button>Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`;
const customOutsideClickCode = `<Dialog>
  <DialogTrigger as={Button} variant="destructive">
    Delete Repository
  </DialogTrigger>
  <DialogContent closeOnOutsideClick={false}>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. Clicking outside this window will not dismiss it.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter class="gap-2">
      <DialogClose as={Button} variant="outline">
        Cancel
      </DialogClose>
      <DialogClose as={Button} variant="destructive">
        Confirm Delete
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`;
const noBlurCode = `<Dialog>
  <DialogTrigger as={Button} variant="secondary">
    No Backdrop Blur
  </DialogTrigger>
  <DialogContent blur={false}>
    <DialogHeader>
      <DialogTitle>Clear Overlay</DialogTitle>
      <DialogDescription>
        This dialog disables the background backdrop blur effect.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose as={Button}>Close</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`;
const noCloseButtonCode = `<Dialog>
  <DialogTrigger as={Button} variant="outline">
    Custom Footer Close Only
  </DialogTrigger>
  <DialogContent showCloseButton={false}>
    <DialogHeader>
      <DialogTitle>Terms of Service</DialogTitle>
      <DialogDescription>
        Please review the policy agreement before continuing.
      </DialogDescription>
    </DialogHeader>
    <div class="py-2 text-sm text-muted-foreground leading-relaxed">
      By clicking Accept, you agree to our terms and conditions.
    </div>
    <DialogFooter>
      <DialogClose as={Button} variant="outline">Decline</DialogClose>
      <DialogClose as={Button}>Accept</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>`;
export default function Demo() {

return <>
                    <Dialog>
                        <DialogTrigger as={Button} variant="outline">
                            Edit Profile
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Profile</DialogTitle>
                                <DialogDescription>
                                    Make changes to your profile here. Click save when you are done.
                                </DialogDescription>
                            </DialogHeader>
                            <div class="space-y-4 py-2">
                                <div class="space-y-2">
                                    <Label for="hero-dialog-name">Name</Label>
                                    <Input id="hero-dialog-name" value="Niko Pirosmani" />
                                </div>
                                <div class="space-y-2">
                                    <Label for="hero-dialog-user">Username</Label>
                                    <Input id="hero-dialog-user" value="@pirosmani" />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose as={Button} variant="outline">Cancel</DialogClose>
                                <Button>Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>;
}
