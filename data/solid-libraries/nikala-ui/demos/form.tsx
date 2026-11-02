import { createSignal, Show } from "solid-js";
import { createForm } from "@nikala-ui/hooks";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
const importCode = `import { Form } from "@/components/ui/form";
import { createForm } from "@/hooks/create-form";`;
const usageCode = `const form = createForm({
  initialValues: { email: "" },
  validate: (values) => ({
    ...(!values.email.includes("@") && { email: "Enter a valid email." }),
  }),
  onSubmit: async (values) => {
    await saveProfile(values);
  },
});

<Form onSubmit={form.handleSubmit} loading={form.isSubmitting()}>
  <Field>
    <FieldLabel for="email">Email address</FieldLabel>
    <Input
      id="email"
      value={form.values().email}
      onInput={form.handleChange("email")}
      onBlur={form.handleBlur("email")}
    />
    <FormMessage form={form} name="email" />
  </Field>
  <Button type="submit" disabled={form.isSubmitting()}>Save</Button>
</Form>`;
const loginCode = `<Form onSubmit={form.handleSubmit} loading={form.isSubmitting()}>
  <Field>
    <FieldLabel for="login-email">Email address</FieldLabel>
    <Input id="login-email" type="email" placeholder="you@example.com" />
  </Field>
  <Field>
    <FieldLabel for="login-password">Password</FieldLabel>
    <Input id="login-password" type="password" placeholder="Your password" />
  </Field>
  <Button type="submit" class="w-full">Sign in</Button>
</Form>`;
const contactCode = `<Form onSubmit={form.handleSubmit} loading={form.isSubmitting()}>
  <Field>
    <FieldLabel for="contact-name">Name</FieldLabel>
    <Input id="contact-name" placeholder="Niko Pirosmani" />
  </Field>
  <Field>
    <FieldLabel for="contact-message">Message</FieldLabel>
    <Textarea id="contact-message" placeholder="How can we help?" />
  </Field>
  <Button type="submit">Send message</Button>
</Form>`;
function FormDemo() {
  const [submitted, setSubmitted] = createSignal(false);

  const form = createForm({
    initialValues: { email: "" },
    validate: (values) => {
      if (!values.email.trim()) return { email: "Email address is required." };
      if (!values.email.includes("@")) return { email: "Enter a valid email address." };
      return {};
    },
    onSubmit: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setSubmitted(true);
    },
  });

  return (
    <div class="w-full max-w-sm">
      <Form onSubmit={form.handleSubmit} loading={form.isSubmitting()} class="rounded-lg border border-border bg-card p-5">
        <Field>
          <FieldLabel for="form-email">Email address</FieldLabel>
          <Input
            id="form-email"
            type="email"
            value={form.values().email}
            onInput={form.handleChange("email")}
            onBlur={form.handleBlur("email")}
            aria-invalid={form.touched().email && Boolean(form.errors().email) ? "true" : undefined}
            placeholder="nikala@pirosmani.ge"
          />
          <FieldDescription>We will only use this for account notifications.</FieldDescription>
          <FormMessage form={form} name="email" />
        </Field>
        <div class="flex items-center gap-2">
          <Button type="submit" disabled={form.isSubmitting()}>
            {form.isSubmitting() ? "Saving..." : "Save email"}
          </Button>
          <Button type="button" variant="outline" onClick={() => { form.resetForm(); setSubmitted(false); }}>
            Reset
          </Button>
        </div>
        <Show when={submitted()}>
          <p class="text-sm text-emerald-600 dark:text-emerald-400">Form submitted successfully.</p>
        </Show>
      </Form>
    </div>
  );
}
export default function Demo() {

return <>
          <FormDemo />
        </>;
}
