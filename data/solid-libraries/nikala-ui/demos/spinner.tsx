import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
const importCode = `import { Spinner } from "@/components/ui/spinner";`;
const defaultCode = `<Spinner />`;
const sizesCode = `<div class="flex items-center gap-4">
  <Spinner size="sm" />
  <Spinner />
  <Spinner size="lg" />
</div>`;
const buttonCode = `<Button disabled>
  <Spinner size="sm" class="text-current" />
  Saving changes...
</Button>`;
export default function Demo() {

return <>
          <Spinner />
        </>;
}
