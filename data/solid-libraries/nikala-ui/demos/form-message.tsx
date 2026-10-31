import { createSignal } from "solid-js";
import { createForm } from "@nikala-ui/hooks";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
const importCode = `import { FormMessage } from "@/components/ui/form-message";`;
const usageCode = `const form = createForm({
  initialValues: { email: "" },
  validate: (values) => ({
    ...(!values.email.includes("@") && { email: "Enter a valid email." }),
  }),
});

<Field>
  <FieldLabel for="email">Email address</FieldLabel>
  <Input
    id="email"
    value={form.values().email}
    onInput={form.handleChange("email")}
    onBlur={form.handleBlur("email")}
  />
  <FormMessage form={form} name="email" />
</Field>`;
function FormMessageDemo() {
  const form = createForm({
    initialValues: { email: "invalid-email" },
    validateOn: "blur",
    validate: (values) =>
      values.email.includes("@") ? {} : { email: "Enter a valid email address." },
  });
  form.setFieldError("email", "Enter a valid email address.");
  const [showUntouched, setShowUntouched] = createSignal(true);

  return (
    <Form class="w-full max-w-sm rounded-lg border border-border bg-card p-5">
      <Field>
        <FieldLabel for="message-email">Email address</FieldLabel>
        <Input
          id="message-email"
          value={form.values().email}
          onInput={form.handleChange("email")}
          onBlur={form.handleBlur("email")}
          placeholder="you@example.com"
        />
        <FormMessage
          form={form}
          name="email"
          showUntouched={showUntouched()}
        />
      </Field>
      <label class="flex items-center gap-2 text-xs text-muted-foreground">
        <Checkbox
          checked={showUntouched()}
          onChange={setShowUntouched}
        />
        Show before blur
      </label>
    </Form>
  );
}
export default function Demo() {

return <>
          <FormMessageDemo />
        </>;
}
