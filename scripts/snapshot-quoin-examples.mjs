/** Capture reviewed Quoin examples from the pinned upstream checkout.
 * Run with its checkout path; no network access or application code is executed. */
import { createHash } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import postcss from "postcss";
import { quoinComponents, QUOIN_REVISION, QUOIN_SOURCE_URL } from "../data/quoin/catalog.ts";

const upstream = resolve(process.argv[2] ?? "node_modules/.cache/col-quoin-upstream");
if (execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== QUOIN_REVISION) {
  throw new Error("The Quoin checkout must match the recorded source revision");
}
if (execFileSync("git", ["-C", upstream, "status", "--porcelain", "--untracked-files=no"], { encoding: "utf8" }).trim()) {
  throw new Error("The Quoin checkout has modified tracked source files");
}
// Read immutable Git blobs, not working-tree bytes that may be edited or CRLF-converted.
const readSource = path => execFileSync("git", ["-C", upstream, "show", `${QUOIN_REVISION}:${path}`]);
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
  return <Button onClick={() => setCount(value => value + 1)}>Count: {count()}</Button>;
}
`,
    css: "button { font: inherit; padding: 0.5rem 0.75rem; color: inherit; background: transparent; border: 1px solid currentColor; }",
  },
  Autocomplete: {
    path: "src/autocomplete/root/autocomplete-root.tsx",
    code: `import { createSignal } from "solid-js";
import { Autocomplete } from "quoin-ui/autocomplete";

export default function ExampleAutocomplete() {
  const [value, setValue] = createSignal("");
  const [open, setOpen] = createSignal(false);
  return <Autocomplete.Root value={value()} onValueChange={setValue} open={open()} onOpenChange={setOpen}>
    <label for="fruit-autocomplete">Fruit</label>
    <Autocomplete.Input id="fruit-autocomplete" />
    <Autocomplete.Portal><Autocomplete.Positioner sideOffset={4}><Autocomplete.Popup class="Popup">
      <Autocomplete.List>
        <Autocomplete.Item value="Apple">Apple</Autocomplete.Item>
        <Autocomplete.Item value="Banana">Banana</Autocomplete.Item>
        <Autocomplete.Item value="Pear">Pear</Autocomplete.Item>
      </Autocomplete.List>
      <Autocomplete.Empty>No matches</Autocomplete.Empty>
    </Autocomplete.Popup></Autocomplete.Positioner></Autocomplete.Portal>
  </Autocomplete.Root>;
}
`,
  },
  Combobox: {
    path: "src/combobox/root/combobox-root.tsx",
    code: `import { createSignal } from "solid-js";
import { Combobox } from "quoin-ui/combobox";

export default function ExampleCombobox() {
  const [value, setValue] = createSignal<string | null>(null);
  const [open, setOpen] = createSignal(false);
  return <Combobox.Root<string> value={value()} onValueChange={next => { if (!Array.isArray(next)) setValue(next); }} open={open()} onOpenChange={setOpen}>
    <label for="fruit-combobox">Fruit</label>
    <Combobox.Input id="fruit-combobox" />
    <Combobox.Trigger aria-label="Show fruit">Choose</Combobox.Trigger>
    <Combobox.Portal><Combobox.Positioner sideOffset={4}><Combobox.Popup class="Popup">
      <Combobox.List>
        <Combobox.Item value="Apple">Apple</Combobox.Item>
        <Combobox.Item value="Banana">Banana</Combobox.Item>
        <Combobox.Item value="Pear">Pear</Combobox.Item>
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
    <Drawer.Trigger>Open drawer</Drawer.Trigger>
    <Drawer.Portal>
      <Drawer.Backdrop class="Backdrop" />
      <Drawer.Viewport class="DrawerViewport"><Drawer.Popup class="DrawerPopup">
        <Drawer.Title>Notifications</Drawer.Title>
        <Drawer.Description>No new notifications.</Drawer.Description>
        <Drawer.Close>Close</Drawer.Close>
      </Drawer.Popup></Drawer.Viewport>
    </Drawer.Portal>
  </Drawer.Root></Drawer.Provider>;
}
`,
    css: ".Backdrop { position: fixed; inset: 0; background: #0008; } .DrawerViewport { position: fixed; inset: 0; display: flex; align-items: end; pointer-events: none; } .DrawerPopup { width: 100%; padding: 1rem; background: var(--color-bg); color: var(--color-fg); pointer-events: auto; transform: translateY(var(--drawer-swipe-movement-y, 0px)); }",
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
      <OTPField.Input aria-label="Digit 1" />
      <OTPField.Input aria-label="Digit 2" />
      <OTPField.Input aria-label="Digit 3" />
      <OTPField.Input aria-label="Digit 4" />
    </OTPField.Root>
    <output>{value().length === 4 ? "Code entered" : "Enter four digits"}</output>
  </>;
}
`,
    css: "[role=group] { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; } input { width: 2.5rem; text-align: center; padding: 0.5rem; }",
  },
  "Direction Provider": {
    path: "src/direction-provider/direction-provider.tsx",
    code: `import { createSignal } from "solid-js";
import { DirectionProvider } from "quoin-ui/direction-provider";
import { Tabs } from "quoin-ui/tabs";

export default function ExampleDirectionProvider() {
  const [value, setValue] = createSignal<unknown>("first");
  return <DirectionProvider direction="rtl"><div dir="rtl">
    <Tabs.Root value={value()} onValueChange={setValue}>
      <Tabs.List aria-label="Sections"><Tabs.Tab value="first">First</Tabs.Tab><Tabs.Tab value="second">Second</Tabs.Tab></Tabs.List>
      <Tabs.Panel value="first">First section</Tabs.Panel>
      <Tabs.Panel value="second">Second section</Tabs.Panel>
    </Tabs.Root>
  </div></DirectionProvider>;
}
`,
    css: "[role=tablist] { display: flex; gap: 1rem; margin-bottom: 1rem; } [role=tab][aria-selected=true] { text-decoration: underline; }",
  },
  "CSP Provider": {
    path: "src/csp-provider/csp-provider.tsx",
    code: `import { CSPProvider } from "quoin-ui/csp-provider";
import { ScrollArea } from "quoin-ui/scroll-area";

export default function ExampleCSPProvider() {
  return <CSPProvider disableStyleElements>
    <ScrollArea.Root class="ScrollRoot"><ScrollArea.Viewport class="ScrollViewport">
      <ScrollArea.Content>
        <p>Generated style elements are disabled for these descendants.</p>
        <p>The application supplies its own stylesheet.</p>
        <p>A production nonce must come from your server's CSP response.</p>
        <p>This provider does not relax the sandbox policy.</p>
      </ScrollArea.Content>
    </ScrollArea.Viewport></ScrollArea.Root>
  </CSPProvider>;
}
`,
    css: ".ScrollRoot { width: 20rem; max-width: 100%; } .ScrollViewport { height: 8rem; overflow: auto; }",
  },
};

// Neutral colors follow the renderer's explicit color-scheme, not the OS setting.
const theme = `:root {
  --color-gray-50: light-dark(#fafafa, #000);
  --color-gray-100: light-dark(#f2f2f2, #181818);
  --color-gray-200: light-dark(#e5e5e5, #333);
  --color-gray-300: light-dark(#ccc, #555);
  --color-gray-400: light-dark(#999, #aaa);
  --color-gray-500: light-dark(#666, #bbb);
  --color-gray-600: light-dark(#555, #ccc);
  --color-gray-700: light-dark(#333, #ddd);
  --color-gray-800: light-dark(#222, #eee);
  --color-gray-900: light-dark(#111, #fff);
  --color-gray-950: light-dark(#000, #fff);
  --color-blue: light-dark(#174ea6, #b4ceff);
  --color-red: light-dark(#b00020, #ffb4b4);
  --color-bg: light-dark(#fff, #000);
  --color-fg: light-dark(#111, #fff);
  --color-muted: light-dark(#555, #ccc);
  --color-border: light-dark(#ccc, #555);
  --color-popup: var(--color-bg);
  --color-popup-fg: var(--color-fg);
  --color-hover: transparent;
  --color-surface: var(--color-bg);
}
button, input { font: inherit; color: inherit; background: transparent; }
.Popup { padding: 0.75rem; background: var(--color-bg); color: var(--color-fg); border: 1px solid var(--color-border); }
[role=option] { padding: 0.25rem 0.5rem; }
`;

function adaptStyles(css) {
  const sheet = postcss.parse(css);
  sheet.walkAtRules("media", rule => {
    if (rule.params !== "(prefers-color-scheme: dark)") return;
    const selector = rule.parent.type === "rule" ? ":root.dark &" : ":root.dark";
    rule.replaceWith(postcss.rule({ selector, nodes: rule.nodes }));
  });
  sheet.walkDecls("border-radius", declaration => { declaration.value = "0"; });
  sheet.walkRules(rule => {
    if (/:hover|:active|\[data-highlighted\]/.test(rule.selector)) {
      rule.walkDecls(/^(background|background-color|box-shadow)$/, declaration => declaration.remove());
      // Do not leave inverse text behind after removing its dark highlight.
      rule.walkDecls("color", declaration => { declaration.value = "inherit"; });
      if (rule.selector.includes("[data-highlighted]") && !rule.selector.includes("::")) {
        rule.append({ prop: "text-decoration", value: "underline" });
      }
    }
    if (rule.selector === ".Panel") {
      rule.walkDecls(/^(background|background-color|border|box-shadow|outline)$/, declaration => declaration.remove());
    }
  });
  return sheet.toString();
}

const examples = {};
for (const component of quoinComponents) {
  const authored = manual[component.name];
  if (authored) {
    examples[component.name] = {
      code: authored.code,
      css: theme + (authored.css ?? ""),
      source: await source(authored.path),
      gaps: ["Col-authored example composition of the published Quoin API; the cited source is the API implementation, not an upstream demo."],
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
  const gaps = ["Upstream demo composition with package imports and CSS-module class names adapted for standalone use. Example styling is neutralized for Col's explicit theme; component implementations are unchanged."];
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
                  <Menu.Item class={styles.Item} onClick={() => setSelected("Copy link selected")}>Copy link</Menu.Item>
                  <Menu.Item class={styles.Item} onClick={() => setSelected("Email selected")}>Email</Menu.Item>
                </Menu.Popup>
              </Menu.Positioner></Menu.Portal>
            </Menu.SubmenuRoot>`)
      .replace('</Menu.Root>', '</Menu.Root><output aria-live="polite">{selected()}</output></>');
    supportingSources.push(await source("src/menu/submenu-root/menu-submenu-root.tsx"), await source("src/menu/item/menu-item.tsx"));
    gaps.push("The upstream menu composition is extended with a controlled submenu and local selection feedback. Item callbacks only update text; no clipboard, email, or external action is performed.");
  }
  if (component.name === "Navigation Menu") {
    code = code
      .replace(/href="https?:\/\/[^"\n]+"/g, 'href="#preview"')
      .replace(/href: "\/react\/[^"\n]+"/g, 'href: "#preview"')
      .replace('<NavigationMenu.Link {...props} />', '<NavigationMenu.Link {...props} onClick={(event) => event.preventDefault()} />');
    gaps.push("Navigation links are adapted to local fragments and prevent their default navigation. The real Navigation Menu interactions remain active; no destination is opened.");
  }
  if (/src="https?:/.test(code)) gaps.push("The upstream demo includes a remote image. The sandbox may block it; its original fallback is retained and no replacement image is supplied.");
  if (/href="https?:/.test(code)) gaps.push("The upstream demo contains external links. Their destinations are not loaded by this preview and navigation may be blocked by the sandbox.");
  if (component.name === "Form") gaps.push("Submission uses the upstream example's simulated response, not an application backend.");
  examples[component.name] = {
    code,
    css: theme + adaptStyles(readSource(cssPath).toString("utf8")),
    source: await source(demoPath),
    sources: [await source(demoPath), await source(cssPath), ...supportingSources],
    gaps,
  };
}
await mkdir("data/quoin", { recursive: true });
await writeFile("data/quoin/examples.json", `${JSON.stringify(examples, null, 2)}\n`);
console.log(`Captured ${Object.keys(examples).length} Quoin examples`);
