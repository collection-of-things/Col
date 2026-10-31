import { Skeleton } from "@/components/ui/skeleton";
const importCode = `import { Skeleton } from "@/components/ui/skeleton";`;
const defaultCode = `<div class="flex items-center space-x-4">
  <Skeleton class="h-12 w-12 rounded-lg" />
  <div class="space-y-2">
    <Skeleton class="h-4 w-50" />
    <Skeleton class="h-4 w-37.5" />
  </div>
</div>`;
const cardSkeletonCode = `<div class="flex flex-col space-y-3 max-w-xs w-full p-4 border border-border rounded-lg bg-card">
  <Skeleton class="h-31.25 w-full rounded-lg" />
  <div class="space-y-2">
    <Skeleton class="h-4 w-62.5" />
    <Skeleton class="h-4 w-50" />
  </div>
</div>`;
export default function Demo() {

return <>
          <div class="flex items-center space-x-4">
            <Skeleton class="h-12 w-12 rounded-lg" />
            <div class="space-y-2">
              <Skeleton class="h-4 w-50" />
              <Skeleton class="h-4 w-37.5" />
            </div>
          </div>
        </>;
}
