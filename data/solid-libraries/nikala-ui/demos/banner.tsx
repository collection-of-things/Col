import { Banner } from "@/components/ui/banner";
import { AlertCircle } from "lucide-solid";
const importCode = `import { Banner } from "@/components/ui/banner";`;
const defaultCode = `<Banner
  variant="warning"
  dismissible={true}
  link="https://https://github.com/nikala-ui/ui"
  linkText="GitHub"
>
  Website is under active construction. Some pages and components are in preview mode.
</Banner>`;
const variantsCode = `<Banner variant="default">Default announcement banner</Banner>
<Banner variant="info">Informational update banner</Banner>
<Banner variant="success">Operation completed successfully!</Banner>
<Banner variant="warning">Warning: Unsaved changes ahead</Banner>
<Banner variant="destructive">Critical system alert</Banner>
<Banner variant="pirosmani">Nikala Pirosmani signature Qvevri wine accent</Banner>`;
const linkCode = `<Banner
  variant="info"
  link="https://https://github.com/nikala-ui/ui"
  linkText="View on GitHub"
>
  Check out the official Nikala UI open-source repository.
</Banner>`;
const customIconCode = `<Banner
  variant="destructive"
  icon={AlertCircle}
>
  High priority security patch required. Please update immediately.
</Banner>`;
const nonDismissibleCode = `<Banner variant="warning" dismissible={false}>
  Persistent header message that cannot be closed by user.
</Banner>`;
export default function Demo() {

return <>
          <div class="w-full">
            <Banner
              variant="warning"
              dismissible={true}
              link="https://https://github.com/nikala-ui/ui"
              linkText="GitHub"
            >
              Website is under active construction. Some pages and components are in preview mode.
            </Banner>
          </div>
        </>;
}
