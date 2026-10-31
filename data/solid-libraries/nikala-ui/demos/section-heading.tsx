import { SectionHeading } from "@/components/ui/section-heading";
const importCode = `import { SectionHeading } from "@/components/ui/section-heading";`;
const pageCode = `<SectionHeading
  variant="page"
  title="Button"
  badge="ui"
  description="A versatile interactive button component with multiple variants and sizes."
/>`;
const sectionCode = `<SectionHeading
  variant="section"
  title="ButtonProps"
  badge="Props"
  description="Configuration options for the Button component."
/>`;
const noBadgeCode = `<SectionHeading
  variant="section"
  title="Installation"
  description="Follow these steps to add the component to your project."
/>`;
const badgeVariantCode = `<SectionHeading
  variant="page"
  title="Dialog"
  badge="New"
  badgeVariant="default"
  description="A modal dialog component with overlay and focus trapping."
/>`;
export default function Demo() {

return <>
          <div class="w-full max-w-xl">
            <SectionHeading
              variant="page"
              title="Button"
              badge="ui"
              description="A versatile interactive button component with multiple variants and sizes."
            />
          </div>
        </>;
}
