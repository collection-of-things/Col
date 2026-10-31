import { Pager, PagerLink } from "@/components/ui/pager";
const importCode = `import { Pager, PagerLink } from "@/components/ui/pager";`;
const defaultCode = `<Pager
  prev={{ title: "Pagination", href: "/docs/components/pagination" }}
  next={{ title: "Separator", href: "/docs/components/separator" }}
/>`;
const nextOnlyCode = `<Pager
  next={{ title: "Installation & Setup", href: "/docs/getting-started/installation" }}
/>`;
const prevOnlyCode = `<Pager
  prev={{ title: "Theming & Customization", href: "/docs/getting-started/theming" }}
/>`;
const composableCode = `<Pager>
  <PagerLink
    type="prev"
    title="Architecture Overview"
    href="/docs/architecture"
  />
  <PagerLink
    type="next"
    title="CLI Tool Reference"
    href="/docs/cli"
  />
</Pager>`;
const courseCode = `<Pager class="mt-0 pt-0 border-t-0">
  <PagerLink
    type="prev"
    title="Chapter 1: Fine-Grained Reactivity"
    href="#"
  />
  <PagerLink
    type="next"
    title="Chapter 3: SSR & Hydration Boundaries"
    href="#"
  />
</Pager>`;
export default function Demo() {

return <>
          <div class="w-full max-w-2xl">
            <Pager
              prev={{ title: "Pagination", href: "/docs/components/pagination" }}
              next={{ title: "Separator", href: "/docs/components/separator" }}
            />
          </div>
        </>;
}
