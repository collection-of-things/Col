import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
const importCode = `import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";`;
const defaultCode = `<Accordion collapsible defaultValue="item-1" class="max-w-md">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is Nikala UI free to use?</AccordionTrigger>
    <AccordionContent>
      Yes, Nikala UI is 100% open-source MIT licensed for personal and commercial projects.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Does it support Tailwind CSS v4?</AccordionTrigger>
    <AccordionContent>
      Yes! Nikala UI is designed specifically around Tailwind v4's CSS-first theme architecture.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger>How does reactivity work?</AccordionTrigger>
    <AccordionContent>
      Components use SolidJS's native splitProps and Kobalte accessible primitives for fine-grained reactivity.
    </AccordionContent>
  </AccordionItem>
</Accordion>`;
const multipleCode = `<Accordion type="multiple" defaultValue={["item-1", "item-2"]} class="max-w-md">
  <AccordionItem value="item-1">
    <AccordionTrigger>Can I open multiple sections at once?</AccordionTrigger>
    <AccordionContent>
      Yes, set type="multiple" on the root Accordion component to allow expanding multiple panels simultaneously.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it fully accessible?</AccordionTrigger>
    <AccordionContent>
      Yes, built on Kobalte primitives with full ARIA roles and keyboard arrow navigation.
    </AccordionContent>
  </AccordionItem>
</Accordion>`;
const disabledCode = `<Accordion collapsible class="max-w-md">
  <AccordionItem value="item-1">
    <AccordionTrigger>Active Section</AccordionTrigger>
    <AccordionContent>
      This accordion section is fully interactive.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2" disabled={true}>
    <AccordionTrigger>Disabled Section</AccordionTrigger>
    <AccordionContent>
      This panel is disabled and cannot be expanded.
    </AccordionContent>
  </AccordionItem>
</Accordion>`;
export default function Demo() {

return <>
          <div class="w-full max-w-md">
            <Accordion collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is Nikala UI free to use?</AccordionTrigger>
                <AccordionContent>
                  Yes, Nikala UI is 100% open-source MIT licensed for personal and commercial projects.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Does it support Tailwind CSS v4?</AccordionTrigger>
                <AccordionContent>
                  Yes! Nikala UI is designed specifically around Tailwind v4's CSS-first theme architecture.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How does reactivity work?</AccordionTrigger>
                <AccordionContent>
                  Components use SolidJS's native splitProps and Kobalte accessible primitives for fine-grained reactivity.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </>;
}
