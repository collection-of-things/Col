/** Capture reviewed Quoin examples from the pinned upstream checkout.
 * Run with its checkout path; no network access or application code is executed. */
import { createHash } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import postcss from "postcss";
import { quoinComponents, QUOIN_REVISION, QUOIN_SOURCE_URL } from "../data/quoin/catalog.ts";

const upstream = resolve(process.argv[2] ?? "node_modules/.cache/col-quoin-upstream");
// The supplied checkout is lower-trust input: ignore its replace refs so a
// substituted object cannot pose as the pinned revision, and stop its config
// from selecting executable helpers such as core.fsmonitor.
const git = (args, options) => execFileSync("git", ["--no-replace-objects", "-c", "core.fsmonitor=false", "-C", upstream, ...args], options);
if (git(["rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== QUOIN_REVISION) {
  throw new Error("The Quoin checkout must match the recorded source revision");
}
if (git(["status", "--porcelain", "--untracked-files=no"], { encoding: "utf8" }).trim()) {
  throw new Error("The Quoin checkout has modified tracked source files");
}
// Read immutable Git blobs, not working-tree bytes that may be edited or CRLF-converted.
const readSource = path => git(["show", `${QUOIN_REVISION}:${path}`]);
const source = async path => ({
  url: `${QUOIN_SOURCE_URL}/blob/${QUOIN_REVISION}/${path}`,
  revision: QUOIN_REVISION,
  integrity: `sha256:${createHash("sha256").update(readSource(path)).digest("hex")}`,
});

const manual = {
  Button: {
    path: "src/button/button.tsx",
    code: `import { createSignal } from "solid-js";
import { Button } from "quoin-ui/button";

export default function ExampleButton() {
  const [count, setCount] = createSignal(0);
  return <Button class="Button" onClick={() => setCount(value => value + 1)}>Count: {count()}</Button>;
}
`,
    styles: ["dialog"],
  },
  Autocomplete: {
    path: "src/autocomplete/root/autocomplete-root.tsx",
    styles: ["input", "menu"],
    code: `import { createSignal } from "solid-js";
import { Autocomplete } from "quoin-ui/autocomplete";

export default function ExampleAutocomplete() {
  const [value, setValue] = createSignal("");
  const [open, setOpen] = createSignal(false);
  return <Autocomplete.Root value={value()} onValueChange={setValue} open={open()} onOpenChange={setOpen}>
    <label for="fruit-autocomplete">Fruit</label>
    <Autocomplete.Input class="Input" id="fruit-autocomplete" />
    <Autocomplete.Portal><Autocomplete.Positioner sideOffset={4}><Autocomplete.Popup class="Popup">
      <Autocomplete.List>
        <Autocomplete.Item class="Item" value="Apple">Apple</Autocomplete.Item>
        <Autocomplete.Item class="Item" value="Banana">Banana</Autocomplete.Item>
        <Autocomplete.Item class="Item" value="Pear">Pear</Autocomplete.Item>
      </Autocomplete.List>
      <Autocomplete.Empty>No matches</Autocomplete.Empty>
    </Autocomplete.Popup></Autocomplete.Positioner></Autocomplete.Portal>
  </Autocomplete.Root>;
}
`,
  },
  Combobox: {
    path: "src/combobox/root/combobox-root.tsx",
    styles: ["input", "menu"],
    code: `import { createSignal } from "solid-js";
import { Combobox } from "quoin-ui/combobox";

export default function ExampleCombobox() {
  const [value, setValue] = createSignal<string | null>(null);
  const [open, setOpen] = createSignal(false);
  return <Combobox.Root<string> value={value()} onValueChange={next => { if (!Array.isArray(next)) setValue(next); }} open={open()} onOpenChange={setOpen}>
    <label for="fruit-combobox">Fruit</label>
    <Combobox.Input class="Input" id="fruit-combobox" />
    <Combobox.Trigger class="Button" aria-label="Show fruit">Choose</Combobox.Trigger>
    <Combobox.Portal><Combobox.Positioner sideOffset={4}><Combobox.Popup class="Popup">
      <Combobox.List>
        <Combobox.Item class="Item" value="Apple">Apple</Combobox.Item>
        <Combobox.Item class="Item" value="Banana">Banana</Combobox.Item>
        <Combobox.Item class="Item" value="Pear">Pear</Combobox.Item>
      </Combobox.List>
      <Combobox.Empty>No matches</Combobox.Empty>
    </Combobox.Popup></Combobox.Positioner></Combobox.Portal>
    <p>Selected: {value() ?? "None"}</p>
  </Combobox.Root>;
}
`,
  },
  Drawer: {
    path: "src/drawer/root/drawer-root.tsx",
    code: `import { createSignal } from "solid-js";
import { Drawer } from "quoin-ui/drawer";

export default function ExampleDrawer() {
  const [open, setOpen] = createSignal(false);
  return <Drawer.Provider><Drawer.Root open={open()} onOpenChange={setOpen}>
    <Drawer.Trigger class="Button">Open drawer</Drawer.Trigger>
    <Drawer.Portal>
      <Drawer.Backdrop class="Backdrop" />
      <Drawer.Viewport class="DrawerViewport"><Drawer.Popup class="Popup DrawerPopup">
        <Drawer.Title class="Title">Notifications</Drawer.Title>
        <Drawer.Description class="Description">No new notifications.</Drawer.Description>
        <Drawer.Close class="Button">Close</Drawer.Close>
      </Drawer.Popup></Drawer.Viewport>
    </Drawer.Portal>
  </Drawer.Root></Drawer.Provider>;
}
`,
    styles: ["dialog"],
    css: ".DrawerViewport { position: fixed; inset: 0; display: flex; align-items: end; pointer-events: none; } .DrawerPopup { position: relative; inset: auto; margin: 0; width: 100%; max-width: 100%; pointer-events: auto; } .DrawerPopup, .DrawerPopup[data-starting-style], .DrawerPopup[data-ending-style] { transform: translateY(var(--drawer-swipe-movement-y, 0px)); }",
  },
  "OTP Field": {
    path: "src/otp-field/root/otp-field-root.tsx",
    code: `import { createSignal } from "solid-js";
import { OTPField } from "quoin-ui/otp-field";

export default function ExampleOTPField() {
  const [value, setValue] = createSignal("");
  return <>
    <p id="otp-label">Verification code</p>
    <OTPField.Root length={4} value={value()} onValueChange={setValue} validationType="numeric" aria-labelledby="otp-label">
      <OTPField.Input class="Input" aria-label="Digit 1" />
      <OTPField.Input class="Input" aria-label="Digit 2" />
      <OTPField.Input class="Input" aria-label="Digit 3" />
      <OTPField.Input class="Input" aria-label="Digit 4" />
    </OTPField.Root>
    <output>{value().length === 4 ? "Code entered" : "Enter four digits"}</output>
  </>;
}
`,
    styles: ["input"],
    css: "[role=group] { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; } .Input { width: 2.5rem; text-align: center; padding-inline: 0; }",
  },
  "Direction Provider": {
    path: "src/direction-provider/direction-provider.tsx",
    code: `import { createSignal } from "solid-js";
import { DirectionProvider } from "quoin-ui/direction-provider";
import { Tabs } from "quoin-ui/tabs";

export default function ExampleDirectionProvider() {
  const [value, setValue] = createSignal<unknown>("first");
  return <DirectionProvider direction="rtl"><div dir="rtl">
    <Tabs.Root class="Tabs" value={value()} onValueChange={setValue}>
      <Tabs.List class="List" aria-label="Sections"><Tabs.Tab class="Tab" value="first">First</Tabs.Tab><Tabs.Tab class="Tab" value="second">Second</Tabs.Tab><Tabs.Indicator class="Indicator" /></Tabs.List>
      <Tabs.Panel class="Panel" value="first">First section</Tabs.Panel>
      <Tabs.Panel class="Panel" value="second">Second section</Tabs.Panel>
    </Tabs.Root>
  </div></DirectionProvider>;
}
`,
    styles: ["tabs"],
  },
  "CSP Provider": {
    path: "src/csp-provider/csp-provider.tsx",
    code: `import { CSPProvider } from "quoin-ui/csp-provider";
import { ScrollArea } from "quoin-ui/scroll-area";

export default function ExampleCSPProvider() {
  return <CSPProvider disableStyleElements>
    <ScrollArea.Root class="ScrollArea"><ScrollArea.Viewport class="Viewport">
      <ScrollArea.Content class="Content">
        <p>Generated style elements are disabled for these descendants.</p>
        <p>The application supplies its own stylesheet.</p>
        <p>A production nonce must come from your server's CSP response.</p>
        <p>This provider does not relax the sandbox policy.</p>
      </ScrollArea.Content>
    </ScrollArea.Viewport></ScrollArea.Root>
  </CSPProvider>;
}
`,
    styles: ["scroll-area"],
  },
};

// Preserve the official CSS declarations; bind only its theme conditions to
// the renderer's explicit selection, which can differ from the host OS theme.
function adaptStyles(css) {
  const sheet = postcss.parse(css);
  sheet.walkAtRules("media", rule => {
    const match = /^\(prefers-color-scheme: (light|dark)\)$/.exec(rule.params);
    if (!match) return;
    const root = match[1] === "dark" ? ":root.dark" : ":root:not(.dark)";
    if (rule.parent.type === "rule") {
      rule.replaceWith(postcss.rule({ selector: `${root} &`, nodes: rule.nodes }));
    } else {
      for (const child of rule.nodes) {
        if (child.type !== "rule") continue;
        child.selectors = child.selectors.map(selector => selector === ":root" ? root : `${root} ${selector}`);
      }
      rule.replaceWith(...rule.nodes);
    }
  });
  return sheet.toString();
}

const themePath = "demo/src/theme.css";
const theme = adaptStyles(readSource(themePath).toString("utf8"));
const themeSource = await source(themePath);

const examples = {};
for (const component of quoinComponents) {
  const authored = manual[component.name];
  if (authored) {
    examples[component.name] = {
      code: authored.code,
      css: theme + authored.styles.map(name => adaptStyles(readSource(`demo/src/styles/${name}.module.css`).toString("utf8"))).join("\n") + (authored.css ?? ""),
      source: await source(authored.path),
      sources: [await source(authored.path), themeSource, ...await Promise.all(authored.styles.map(name => source(`demo/src/styles/${name}.module.css`)))],
      gaps: ["Col-authored example composition of the published Quoin API; no matching upstream demo exists at this revision. Appearance reuses the cited official demo styles and theme, with layout-only adjustments for this composition."],
    };
    continue;
  }
  const demo = component.subpath === "radio-group" ? "radio" : component.subpath;
  const demoPath = `demo/src/solid/${demo}.tsx`;
  const cssPath = `demo/src/styles/${demo}.module.css`;
  const original = readSource(demoPath).toString("utf8");
  const classes = Object.fromEntries([...new Set([...original.matchAll(/styles\.([A-Za-z_][\w]*)/g)].map(match => match[1]))].map(name => [name, name]));
  let code = original
    .replace(/from "\.\.\/\.\.\/\.\.\/src\/([^/]+)\/index\.ts"/g, 'from "quoin-ui/$1"')
    .replace(/import styles from "\.\.\/styles\/[^"\n]+";/, `const styles = ${JSON.stringify(classes)};`);
  const gaps = ["Upstream demo composition with package imports and CSS-module class names adapted for standalone use. Official demo styling and theme values are preserved; color-scheme conditions follow the selected preview theme. Component implementations are unchanged."];
  const supportingSources = [];
  if (component.name === "Menu") {
    code = code
      .replace('const [open, setOpen] = createSignal(false);', `const [open, setOpen] = createSignal(false);
  const [submenuOpen, setSubmenuOpen] = createSignal(false);
  const [selected, setSelected] = createSignal("No action selected");`)
      .replace('<Menu.Root open={open()} onOpenChange={(next) => setOpen(next)}>', '<><Menu.Root open={open()} onOpenChange={(next) => { setOpen(next); if (!next) setSubmenuOpen(false); }}>')
      .replace(/<Menu.Item class={styles.Item}>([^<]+)<\/Menu.Item>/g, (_, label) => `<Menu.Item class={styles.Item} onClick={() => setSelected(${JSON.stringify(label)})}>${label}</Menu.Item>`)
      .replace('<Menu.Item class={styles.Item} onClick={() => setSelected("Share")}>Share</Menu.Item>', `<Menu.SubmenuRoot open={submenuOpen()} onOpenChange={setSubmenuOpen}>
              <Menu.SubmenuTrigger class={styles.Item}>Share</Menu.SubmenuTrigger>
              <Menu.Portal><Menu.Positioner class={styles.Positioner} side="right" sideOffset={4}>
                <Menu.Popup class={styles.Popup}>
                  <Menu.Item class={styles.Item} onClick={() => { setSelected("Copy link selected"); setSubmenuOpen(false); setOpen(false); }}>Copy link</Menu.Item>
                  <Menu.Item class={styles.Item} onClick={() => { setSelected("Email selected"); setSubmenuOpen(false); setOpen(false); }}>Email</Menu.Item>
                </Menu.Popup>
              </Menu.Positioner></Menu.Portal>
            </Menu.SubmenuRoot>`)
      .replace('</Menu.Root>', '</Menu.Root><output aria-live="polite">{selected()}</output></>');
    supportingSources.push(await source("src/menu/submenu-root/menu-submenu-root.tsx"), await source("src/menu/item/menu-item.tsx"));
    gaps.push("The upstream menu composition is extended with a controlled submenu and local selection feedback. Item callbacks only update text; no clipboard, email, or external action is performed.");
  }
  if (component.name === "Menubar") {
    code = code
      .replace('<ExportSubmenu />', '<ExportSubmenu onSelect={() => setOpen(false)} />')
      .replace('<LayoutSubmenu />', '<LayoutSubmenu onSelect={() => setOpen(false)} />')
      .replace(/function (ExportSubmenu|LayoutSubmenu)\(\) \{([\s\S]*?)(?=\nfunction )/g, (_, name, body) =>
        `function ${name}(props: { onSelect: () => void }) {${body.replaceAll('onClick={handleClick}', 'onClick={(event) => { handleClick(event); props.onSelect(); }}')}`);
    gaps.push("Nested selection explicitly closes the owning top-level menu; Quoin 0.6.0 otherwise closes only the selected item's nearest submenu.");
  }
  if (component.name === "Navigation Menu") {
    code = code
      .replace('export default function ExampleNavigationMenu() {', `export default function ExampleNavigationMenu() {
  // Keep Escape dismissal stable until the pointer leaves or explicitly activates a trigger.
  let hoverDismissed = false;`)
      .replace('<NavigationMenu.Root class={styles.Root}>', `<NavigationMenu.Root class={styles.Root}
      onPointerLeave={() => { hoverDismissed = false; }}
      onValueChange={(_, details) => {
        if (details.reason === "escape-key") hoverDismissed = true;
        else if (details.reason === "trigger-hover" && hoverDismissed) details.cancel();
        else hoverDismissed = false;
      }}>`)
      .replace(/href="https?:\/\/[^"\n]+"/g, 'href="#preview"')
      .replace(/href: "\/react\/[^"\n]+"/g, 'href: "#preview"')
      .replace('<NavigationMenu.Link {...props} />', '<NavigationMenu.Link {...props} onClick={(event) => event.preventDefault()} />');
    gaps.push("Navigation links are adapted to local fragments and prevent their default navigation. The real Navigation Menu interactions remain active; no destination is opened.");
    gaps.push("The composition suppresses hover reopening after Escape until pointer exit or explicit activation, and constrains the popup to the preview viewport.");
  }
  if (/src="https?:/.test(code)) gaps.push("The upstream demo includes a remote image. The sandbox may block it; its original fallback is retained and no replacement image is supplied.");
  if (/href="https?:/.test(code)) gaps.push("The upstream demo contains external links. Their destinations are not loaded by this preview and navigation may be blocked by the sandbox.");
  if (component.name === "Form") {
    code = code
      .replace('const [errors, setErrors] = createSignal<FormErrors>({});', 'const [errors, setErrors] = createSignal<FormErrors>({});\n\tconst [url, setUrl] = createSignal("https://example.com");')
      .replace('setErrors(serverErrors);', 'if (url() === value) setErrors(serverErrors);')
      .replace('value="https://example.com"', 'value={url()}\n\t\t\t\t\tonInput={(event) => { setUrl(event.currentTarget.value); setErrors({}); }}');
    gaps.push("Submission uses the upstream example's simulated response, not an application backend. The URL is signal-controlled and editing it clears the previous server error so a corrected value can be submitted.");
  }
  const responsiveCss = component.name === "Toolbar"
    ? "\n.Toolbar { box-sizing: border-box; max-width: 100%; flex-wrap: wrap; }\n"
    : component.name === "Navigation Menu"
    ? "\n.List, .GridLinkList, .FlexLinkList { list-style: none; margin: 0; padding: 0; }\n.Popup { max-width: calc(100vw - 16px); }\n.Content { box-sizing: border-box; max-width: calc(100vw - 16px); max-height: calc(100vh - 96px); overflow-y: auto; }\n"
    : "";
  if (responsiveCss) gaps.push("Layout-only preview constraints prevent mobile overflow; Navigation Menu lists also reset browser-default bullets and spacing. Upstream colors, corners, and interaction states are retained.");
  examples[component.name] = {
    code,
    css: theme + adaptStyles(readSource(cssPath).toString("utf8")) + responsiveCss,
    source: await source(demoPath),
    sources: [await source(demoPath), await source(cssPath), themeSource, ...supportingSources],
    gaps,
  };
}
await mkdir("data/quoin", { recursive: true });
await writeFile("data/quoin/examples.json", `${JSON.stringify(examples, null, 2)}\n`);
console.log(`Captured ${Object.keys(examples).length} Quoin examples`);
