import Skeleton from "rocksolidjs/Skeleton";

export default function Example() {
  return (
    <div class="flex items-center gap-3">
      <Skeleton variant="circle" class="size-10 shrink-0" />
      <div class="flex flex-col gap-2">
        <Skeleton class="h-4 w-32" />
        <Skeleton class="h-3 w-48" />
      </div>
    </div>
  );
}
