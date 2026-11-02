import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
const importCode = `import { Textarea } from "@/components/ui/textarea";`;
const defaultCode = `<Textarea placeholder="Type your message here..." class="max-w-sm" />`;
const labelCode = `<div class="grid w-full max-w-sm gap-1.5">
  <Label for="message-input">Your Message</Label>
  <Textarea id="message-input" placeholder="Type your feedback..." />
  <p class="text-xs text-muted-foreground">
    Your message will be sent to the Nikala UI maintainers.
  </p>
</div>`;
const maxLengthCode = `<div class="grid w-full max-w-sm gap-1.5">
  <Label for="bio-input">Short Bio</Label>
  <Textarea
    id="bio-input"
    placeholder="Tell us a little bit about yourself..."
    maxLength={120}
  />
</div>`;
const showCountCode = `<div class="grid w-full max-w-sm gap-1.5">
  <Label for="unlimited-input">Feedback Note</Label>
  <Textarea
    id="unlimited-input"
    placeholder="Type a description..."
    showCount={true}
  />
</div>`;
const disabledCode = `<Textarea disabled placeholder="Type your message here..." class="max-w-sm" />`;
export default function Demo() {

return <>
          <div class="w-full max-w-sm">
            <Textarea placeholder="Type your message here..." class="max-w-sm" />
          </div>
        </>;
}
