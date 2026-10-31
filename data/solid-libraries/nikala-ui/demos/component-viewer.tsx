import { ComponentViewer } from "@/components/ui/component-viewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
const importCode = `import { ComponentViewer } from "@/components/ui/component-viewer";`;
const defaultCode = `<ComponentViewer
  name="card"
  title="Interactive Card"
  command="bunx @nikala-ui/cli add card"
  lang="tsx"
  code={\`<Card class="w-full max-w-sm">
  <CardHeader>
    <CardTitle>Welcome to Nikala UI</CardTitle>
    <CardDescription>Tailwind CSS v4 & SolidJS components.</CardDescription>
  </CardHeader>
  <CardContent>
    <p class="text-sm text-muted-foreground">Fine-grained reactivity with zero virtual DOM overhead.</p>
  </CardContent>
  <CardFooter>
    <Button class="w-full">Explore</Button>
  </CardFooter>
</Card>\`}
>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle>Welcome to Nikala UI</CardTitle>
      <CardDescription>Tailwind CSS v4 & SolidJS components.</CardDescription>
    </CardHeader>
    <CardContent>
      <p class="text-sm text-muted-foreground">Fine-grained reactivity with zero virtual DOM overhead.</p>
    </CardContent>
    <CardFooter>
      <Button class="w-full">Explore</Button>
    </CardFooter>
  </Card>
</ComponentViewer>`;
const badgeExampleCode = `<ComponentViewer
  name="badge-group"
  title="Status Badges"
  align="center"
  lang="tsx"
  code={\`<div class="flex items-center gap-2">
  <Badge variant="default">Active</Badge>
  <Badge variant="success">Online</Badge>
  <Badge variant="info">Beta</Badge>
</div>\`}
>
  <div class="flex items-center gap-2">
    <Badge variant="default">Active</Badge>
    <Badge variant="success">Online</Badge>
    <Badge variant="info">Beta</Badge>
  </div>
</ComponentViewer>`;
export default function Demo() {

return <>
          <div class="w-full">
            <ComponentViewer
              name="card"
              title="Interactive Card"
              command="bunx @nikala-ui/cli add card"
              lang="tsx"
              code={`<Card class="w-full max-w-sm">
  <CardHeader>
    <CardTitle>Welcome to Nikala UI</CardTitle>
    <CardDescription>Tailwind CSS v4 & SolidJS components.</CardDescription>
  </CardHeader>
  <CardContent>
    <p class="text-sm text-muted-foreground">Fine-grained reactivity with zero virtual DOM overhead.</p>
  </CardContent>
  <CardFooter>
    <Button class="w-full">Explore</Button>
  </CardFooter>
</Card>`}
            >
              <Card class="w-full max-w-sm">
                <CardHeader>
                  <CardTitle>Welcome to Nikala UI</CardTitle>
                  <CardDescription>Tailwind CSS v4 & SolidJS components.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p class="text-sm text-muted-foreground">Fine-grained reactivity with zero virtual DOM overhead.</p>
                </CardContent>
                <CardFooter>
                  <Button class="w-full">Explore</Button>
                </CardFooter>
              </Card>
            </ComponentViewer>
          </div>
        </>;
}
