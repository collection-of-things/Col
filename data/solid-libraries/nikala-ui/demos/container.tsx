import { Container } from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, Zap, ShieldCheck, ArrowRight } from "lucide-solid";
const importCode = `import { Container } from "@/components/ui/container";`;
const heroCode = `<Container size="2xl" class="py-12 px-4 sm:px-6 lg:px-8 text-center space-y-4 bg-muted/20 border border-border rounded-lg">
  <Badge variant="outline" class="text-xs">Nikala Design System</Badge>
  <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
    Fluid Layout Primitives for SolidJS
  </h1>
  <p class="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
    The Container primitive aligns and bounds horizontal viewport widths across mobile, tablet, and widescreen monitors with responsive gutter tokens.
  </p>
  <div class="flex items-center justify-center gap-3 pt-2">
    <Button size="sm">Get Started</Button>
    <Button variant="outline" size="sm">Components</Button>
  </div>
</Container>`;
const sizesCode = `<div class="space-y-3 w-full">
  <Container size="sm" class="rounded-lg border border-border bg-card p-3 text-center text-xs font-mono text-muted-foreground">
    size="sm" (max-w-screen-sm: 640px)
  </Container>
  <Container size="md" class="rounded-lg border border-border bg-card p-3 text-center text-xs font-mono text-muted-foreground">
    size="md" (max-w-screen-md: 768px)
  </Container>
  <Container size="lg" class="rounded-lg border border-border bg-card p-3 text-center text-xs font-mono text-muted-foreground">
    size="lg" (max-w-screen-lg: 1024px)
  </Container>
  <Container size="xl" class="rounded-lg border border-border bg-card p-3 text-center text-xs font-mono text-muted-foreground">
    size="xl" (max-w-screen-xl: 1280px)
  </Container>
  <Container size="2xl" class="rounded-lg border border-border bg-card p-3 text-center text-xs font-mono text-muted-foreground">
    size="2xl" (max-w-screen-2xl: 1536px)
  </Container>
</div>`;
const gridCode = `<Container size="xl" class="p-0">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card>
      <CardHeader class="pb-2">
        <Zap class="size-5 text-primary mb-1" />
        <CardTitle class="text-base">Fine-Grained Reactivity</CardTitle>
        <CardDescription class="text-xs">Zero Virtual DOM overhead with direct reactive signal bindings.</CardDescription>
      </CardHeader>
    </Card>

    <Card>
      <CardHeader class="pb-2">
        <Layers class="size-5 text-primary mb-1" />
        <CardTitle class="text-base">Tailwind CSS v4</CardTitle>
        <CardDescription class="text-xs">Native CSS custom property tokens and zero legacy config files.</CardDescription>
      </CardHeader>
    </Card>

    <Card>
      <CardHeader class="pb-2">
        <ShieldCheck class="size-5 text-primary mb-1" />
        <CardTitle class="text-base">SSR Safe Hydration</CardTitle>
        <CardDescription class="text-xs">Full SolidStart and Vinxi server-rendering hydration safety guards.</CardDescription>
      </CardHeader>
    </Card>
  </div>
</Container>`;
const articleCode = `<Container as="article" size="md" class="space-y-4 py-4">
  <div class="space-y-2">
    <Badge variant="secondary" class="text-[10px]">Architecture</Badge>
    <h2 class="text-xl font-bold tracking-tight text-foreground">
      Why Fine-Grained Signals Outperform Virtual DOM
    </h2>
    <p class="text-xs text-muted-foreground">September 4, 2026 • 6 min read</p>
  </div>
  <p class="text-xs text-muted-foreground leading-relaxed">
    SolidJS eliminates reconciliation diff algorithms entirely by tracking dependencies directly at the DOM node level. The Container primitive automatically optimizes layout margins for maximum readability.
  </p>
</Container>`;
export default function Demo() {

return <>
          <div class="w-full py-4">
            <Container size="2xl" class="py-10 px-4 sm:px-6 lg:px-8 text-center space-y-4 bg-muted/20 border border-border rounded-lg">
              <Badge variant="outline" class="text-xs">Nikala Design System</Badge>
              <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Fluid Layout Primitives for SolidJS
              </h1>
              <p class="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                The Container primitive aligns and bounds horizontal viewport widths across mobile, tablet, and widescreen monitors with responsive gutter tokens.
              </p>
              <div class="flex items-center justify-center gap-3 pt-2">
                <Button size="sm">Get Started</Button>
                <Button variant="outline" size="sm">Components</Button>
              </div>
            </Container>
          </div>
        </>;
}
