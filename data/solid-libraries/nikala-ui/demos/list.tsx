import { List, ListGroup, ListHeader, ListItem } from "@/components/ui/list";
import { BookOpen, Terminal, Palette, Settings, User, Shield, Bell } from "lucide-solid";
const listGroupCode = `<List class="max-w-md border border-border rounded-lg p-2 bg-card">
  <ListGroup>
    <ListHeader title="Account Settings" />
    <ListItem title="Profile" subtitle="Manage profile details" icon={User} />
    <ListItem title="Security" subtitle="Password and 2FA" icon={Shield} />
  </ListGroup>
  <ListGroup>
    <ListHeader title="Preferences" />
    <ListItem title="Notifications" subtitle="Email and push alerts" icon={Bell} />
  </ListGroup>
</List>`;
const importCode = `import { List, ListGroup, ListHeader, ListItem } from "@/components/ui/list";`;
const defaultCode = `<List class="max-w-md border border-border rounded-lg p-2 bg-card">
  <ListGroup>
    <ListHeader title="Navigation" />
    <ListItem
      title="Getting Started"
      subtitle="Architecture philosophy and installation guide"
      showChevron={true}
      href="/docs"
    />
    <ListItem
      title="CLI Reference"
      subtitle="Commands guide for initializing and managing components"
      showChevron={true}
      href="/docs/cli"
    />
  </ListGroup>
</List>`;
const iconsAndShortcutsCode = `<List class="max-w-md border border-border rounded-lg p-2 bg-card">
  <ListItem
    title="Documentation"
    subtitle="Read system overview"
    icon={BookOpen}
    shortcut="⌘1"
  />
  <ListItem
    title="CLI Reference"
    subtitle="Terminal commands"
    icon={Terminal}
    shortcut="⌘2"
  />
  <ListItem
    title="Theming"
    subtitle="Colors and palettes"
    icon={Palette}
    shortcut="⌘3"
  />
</List>`;
const avatarCode = `<List class="max-w-md border border-border rounded-lg p-2 bg-card">
  <ListItem
    title="Niko Pirosmani"
    subtitle="Georgian Painter & Artist"
    avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
  />
  <ListItem
    title="Magradze"
    subtitle="Nikala UI Creator"
    avatarFallback="M"
  />
</List>`;
const hoverVariantsCode = `<List class="max-w-md border border-border rounded-lg p-2 bg-card">
  <ListItem title="Default Hover Variant" hoverVariant="default" />
  <ListItem title="Primary Accent Hover" hoverVariant="primary" />
  <ListItem title="Subtle Accent Hover" hoverVariant="accent" />
  <ListItem title="Muted Background Hover" hoverVariant="muted" />
</List>`;
export default function Demo() {

return <>
          <List class="w-full max-w-md border border-border rounded-lg p-2 bg-card/30 shadow-xs">
            <ListGroup>
              <ListHeader title="Navigation" />
              <ListItem
                title="Getting Started"
                subtitle="Architecture philosophy and installation guide"
                showChevron={true}
                href="/docs"
              />
              <ListItem
                title="CLI Reference"
                subtitle="Commands guide for initializing and managing components"
                showChevron={true}
                href="/docs/cli"
              />
            </ListGroup>
          </List>
        </>;
}
