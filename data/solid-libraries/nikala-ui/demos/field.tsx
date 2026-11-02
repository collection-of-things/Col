import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
const importCode = `import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";`;
const defaultCode = `<Field class="max-w-sm">
  <FieldLabel for="email">Email address</FieldLabel>
  <Input id="email" type="email" placeholder="nikala@pirosmani.ge" />
  <FieldDescription>We will only use this for account notifications.</FieldDescription>
</Field>`;
const errorCode = `<Field class="max-w-sm">
  <FieldLabel for="username">Username</FieldLabel>
  <Input id="username" aria-invalid="true" value="niko pirosmani" />
  <FieldError>Username can only contain letters, numbers, and underscores.</FieldError>
</Field>`;
export default function Demo() {

return <>
          <Field class="w-full max-w-sm">
            <FieldLabel for="field-email">Email address</FieldLabel>
            <Input id="field-email" type="email" placeholder="nikala@pirosmani.ge" />
            <FieldDescription>
              We will only use this for account notifications.
            </FieldDescription>
          </Field>
        </>;
}
