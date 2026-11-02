import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const importCode = `import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";`;
const defaultCode = `<Tabs defaultValue="account" class="w-100">
  <TabsList class="grid w-full grid-cols-2">
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>

  <TabsContent value="account">
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Make changes to your account here. Click save when you're done.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-2">
        <div class="space-y-1">
          <Label for="name">Name</Label>
          <Input id="name" value="Niko Pirosmani" />
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save changes</Button>
      </CardFooter>
    </Card>
  </TabsContent>

  <TabsContent value="password">
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Change your password here. After saving, you'll be logged out.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-2">
        <div class="space-y-1">
          <Label for="current">Current password</Label>
          <Input id="current" type="password" />
        </div>
        <div class="space-y-1">
          <Label for="new">New password</Label>
          <Input id="new" type="password" />
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save password</Button>
      </CardFooter>
    </Card>
  </TabsContent>
</Tabs>`;
const verticalCode = `<Tabs orientation="vertical" defaultValue="general" class="w-112.5">
  <TabsList class="w-35">
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="notifications">Alerts</TabsTrigger>
    <TabsTrigger value="advanced">Advanced</TabsTrigger>
  </TabsList>

  <div class="flex-1">
    <TabsContent value="general" class="p-4 border border-border rounded-lg bg-card text-xs space-y-1">
      <h4 class="font-bold text-sm text-foreground">General Settings</h4>
      <p class="text-muted-foreground">Manage your workspace overview and profile defaults.</p>
    </TabsContent>

    <TabsContent value="notifications" class="p-4 border border-border rounded-lg bg-card text-xs space-y-1">
      <h4 class="font-bold text-sm text-foreground">Notification Preferences</h4>
      <p class="text-muted-foreground">Configure push alerts and email summaries.</p>
    </TabsContent>

    <TabsContent value="advanced" class="p-4 border border-border rounded-lg bg-card text-xs space-y-1">
      <h4 class="font-bold text-sm text-foreground">Advanced Options</h4>
      <p class="text-muted-foreground">API keys, tokens, and system exports.</p>
    </TabsContent>
  </div>
</Tabs>`;
export default function Demo() {

return <>
          <Tabs defaultValue="account" class="w-100">
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>
                    Make changes to your account here. Click save when you're done.
                  </CardDescription>
                </CardHeader>
                <CardContent class="space-y-2">
                  <div class="space-y-1">
                    <Label for="hero-tabs-name">Name</Label>
                    <Input id="hero-tabs-name" value="Niko Pirosmani" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your password here. After saving, you'll be logged out.
                  </CardDescription>
                </CardHeader>
                <CardContent class="space-y-2">
                  <div class="space-y-1">
                    <Label for="hero-tabs-curr">Current password</Label>
                    <Input id="hero-tabs-curr" type="password" />
                  </div>
                  <div class="space-y-1">
                    <Label for="hero-tabs-new">New password</Label>
                    <Input id="hero-tabs-new" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save password</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </>;
}
