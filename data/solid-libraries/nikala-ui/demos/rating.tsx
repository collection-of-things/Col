import { Component, createSignal } from "solid-js";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
const importCode = `import { Rating } from "@/components/ui/rating";`;
const defaultCode = `import { createSignal } from "solid-js";
import { Rating } from "@/components/ui/rating";

export function RatingDemo() {
  const [rating, setRating] = createSignal(4);

  return (
    <div class="flex flex-col items-center gap-3">
      <Rating value={rating()} onChange={setRating} size="lg" />
      <span class="text-sm text-muted-foreground">
        Selected: {rating()} of 5 stars
      </span>
    </div>
  );
}`;
const sizesCode = `<div class="flex flex-col items-start gap-4">
  <div class="flex items-center gap-4">
    <span class="text-xs font-mono text-muted-foreground w-16">sm</span>
    <Rating size="sm" defaultValue={4} />
  </div>

  <div class="flex items-center gap-4">
    <span class="text-xs font-mono text-muted-foreground w-16">default</span>
    <Rating size="default" defaultValue={4} />
  </div>

  <div class="flex items-center gap-4">
    <span class="text-xs font-mono text-muted-foreground w-16">lg</span>
    <Rating size="lg" defaultValue={4} />
  </div>
</div>`;
const variantsCode = `<div class="flex flex-col items-start gap-4">
  <div class="flex items-center gap-4">
    <span class="text-xs font-mono text-muted-foreground w-24">yellow</span>
    <Rating variant="yellow" defaultValue={5} />
  </div>

  <div class="flex items-center gap-4">
    <span class="text-xs font-mono text-muted-foreground w-24">primary</span>
    <Rating variant="primary" defaultValue={5} />
  </div>

  <div class="flex items-center gap-4">
    <span class="text-xs font-mono text-muted-foreground w-24">destructive</span>
    <Rating variant="destructive" defaultValue={5} />
  </div>
</div>`;
const readOnlyCode = `<div class="flex items-center gap-3 p-4 rounded-lg border border-border bg-card">
  <Rating value={5} readOnly size="sm" />
  <span class="text-sm font-semibold text-foreground">4.9 / 5.0</span>
  <span class="text-xs text-muted-foreground">(1,240 verified reviews)</span>
</div>`;
export default function Demo() {
const [demoRating, setDemoRating] = createSignal(4);
return <>
          <div class="flex flex-col items-center justify-center p-8 gap-3">
            <Rating value={demoRating()} onChange={setDemoRating} size="lg" />
            <div class="flex items-center gap-2 mt-1">
              <Badge variant="secondary" class="font-mono">
                {demoRating()} / 5 Stars
              </Badge>
              <span class="text-xs text-muted-foreground">
                (Click or use arrow keys to change)
              </span>
            </div>
          </div>
        </>;
}
