import { createSignal, For, Show } from "solid-js";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  LayoutGrid,
  List,
  Columns3,
} from "lucide-solid";
const importCode = `import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";`;
const defaultCode = `const [alignment, setAlignment] = createSignal<string>("left");

return (
  <div class="flex flex-col items-center gap-3">
    <ToggleGroup
      type="single"
      value={alignment()}
      onChange={(val) => setAlignment(val || "left")}
      variant="outline"
    >
      <ToggleGroupItem value="left" aria-label="Align Left">
        <AlignLeft class="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align Center">
        <AlignCenter class="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align Right">
        <AlignRight class="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="justify" aria-label="Align Justify">
        <AlignJustify class="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>

    <p class="text-xs text-muted-foreground">
      Selected Alignment: <span class="font-semibold text-foreground">{alignment()}</span>
    </p>
  </div>
);`;
const multipleCode = `const [formats, setFormats] = createSignal<string[]>(["bold", "italic"]);

return (
  <div class="flex flex-col items-center gap-4">
    <ToggleGroup
      type="multiple"
      value={formats()}
      onChange={(val) => setFormats(val)}
      variant="outline"
    >
      <ToggleGroupItem value="bold" aria-label="Toggle Bold">
        <Bold class="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle Italic">
        <Italic class="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle Underline">
        <Underline class="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="strikethrough" aria-label="Toggle Strikethrough">
        <Strikethrough class="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>

    {/* Live Preview Text */}
    <div
      class="rounded-md border border-border bg-card p-4 text-center text-sm transition-all"
      classList={{
        "font-bold": formats().includes("bold"),
        "italic": formats().includes("italic"),
        "underline": formats().includes("underline"),
        "line-through": formats().includes("strikethrough"),
      }}
    >
      Fine-grained SolidJS Reactivity in Action
    </div>
  </div>
);`;
const sizesCode = `<div class="flex flex-col items-center gap-3">
  {/* Small */}
  <ToggleGroup type="single" defaultValue="grid" size="sm" variant="outline">
    <ToggleGroupItem value="grid"><LayoutGrid class="size-3.5" /></ToggleGroupItem>
    <ToggleGroupItem value="list"><List class="size-3.5" /></ToggleGroupItem>
    <ToggleGroupItem value="columns"><Columns3 class="size-3.5" /></ToggleGroupItem>
  </ToggleGroup>

  {/* Default */}
  <ToggleGroup type="single" defaultValue="grid" size="default" variant="outline">
    <ToggleGroupItem value="grid"><LayoutGrid class="size-4" /></ToggleGroupItem>
    <ToggleGroupItem value="list"><List class="size-4" /></ToggleGroupItem>
    <ToggleGroupItem value="columns"><Columns3 class="size-4" /></ToggleGroupItem>
  </ToggleGroup>

  {/* Large */}
  <ToggleGroup type="single" defaultValue="grid" size="lg" variant="outline">
    <ToggleGroupItem value="grid"><LayoutGrid class="size-5" /></ToggleGroupItem>
    <ToggleGroupItem value="list"><List class="size-5" /></ToggleGroupItem>
    <ToggleGroupItem value="columns"><Columns3 class="size-5" /></ToggleGroupItem>
  </ToggleGroup>
</div>`;
export function ToggleGroupHeroDemo() {
  const [alignment, setAlignment] = createSignal<string>("left");

  return (
    <div class="flex flex-col items-center gap-3">
      <ToggleGroup
        type="single"
        value={alignment()}
        onChange={(val) => setAlignment(val || "left")}
        variant="outline"
      >
        <ToggleGroupItem value="left" aria-label="Align Left">
          <AlignLeft class="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align Center">
          <AlignCenter class="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align Right">
          <AlignRight class="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="justify" aria-label="Align Justify">
          <AlignJustify class="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <p class="text-xs text-muted-foreground">
        Active: <span class="font-mono font-medium text-foreground">{alignment()}</span>
      </p>
    </div>
  );
}
export function ToggleGroupMultipleDemo() {
  const [formats, setFormats] = createSignal<string[]>(["bold", "italic"]);

  return (
    <div class="flex flex-col items-center gap-4 w-full max-w-sm">
      <ToggleGroup
        type="multiple"
        value={formats()}
        onChange={(val) => setFormats(val)}
        variant="outline"
      >
        <ToggleGroupItem value="bold" aria-label="Toggle Bold">
          <Bold class="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Toggle Italic">
          <Italic class="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Toggle Underline">
          <Underline class="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="strikethrough" aria-label="Toggle Strikethrough">
          <Strikethrough class="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <div
        class="w-full rounded-lg border border-border bg-card p-4 text-center text-sm transition-all"
        classList={{
          "font-bold": formats().includes("bold"),
          italic: formats().includes("italic"),
          underline: formats().includes("underline"),
          "line-through": formats().includes("strikethrough"),
        }}
      >
        Fine-grained SolidJS Reactivity in Action
      </div>
    </div>
  );
}
export default function Demo() {

return <>
          <ToggleGroupHeroDemo />
        </>;
}
