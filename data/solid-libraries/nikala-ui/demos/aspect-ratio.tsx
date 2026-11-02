import { AspectRatio } from "@/components/ui/aspect-ratio";
const importCode = `import { AspectRatio } from "@/components/ui/aspect-ratio";`;
const defaultCode = `<div class="w-full max-w-sm">
  <AspectRatio ratio={16 / 9} class="bg-muted rounded-lg border border-border">
    <img
      src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
      alt="Photo by Drew Beamer"
      class="h-full w-full object-cover"
    />
  </AspectRatio>
</div>`;
const ratio4x3Code = `<div class="w-full max-w-sm">
  <AspectRatio ratio={4 / 3} class="bg-muted rounded-lg border border-border">
    <img
      src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=800&dpr=2&q=80"
      alt="Landscape Photo"
      class="h-full w-full object-cover"
    />
  </AspectRatio>
</div>`;
const ratio1x1Code = `<div class="w-72">
  <AspectRatio ratio={1 / 1} class="bg-muted rounded-lg border border-border flex items-center justify-center p-4">
    <div class="flex flex-col items-center justify-center text-center space-y-2">
      <div class="h-12 w-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
        1:1
      </div>
      <span class="text-sm font-semibold">Square Aspect Ratio</span>
      <p class="text-xs text-muted-foreground">Perfect for avatars, album art, or cards.</p>
    </div>
  </AspectRatio>
</div>`;
export default function Demo() {

return <>
          <div class="w-full max-w-sm">
            <AspectRatio ratio={16 / 9} class="bg-muted rounded-lg border border-border">
              <img
                src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                alt="Photo by Drew Beamer"
                class="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
        </>;
}
