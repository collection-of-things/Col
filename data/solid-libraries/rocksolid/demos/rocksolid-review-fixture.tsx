import { createSignal, Show } from "solid-js";
import { render } from "solid-js/web";
import Accordion from "rocksolidjs/Accordion";
import AccordionDetails from "rocksolidjs/AccordionDetails";
import AccordionSummary from "rocksolidjs/AccordionSummary";
import Avatar from "rocksolidjs/Avatar";
import Breadcrumbs from "rocksolidjs/Breadcrumbs";
import Button from "rocksolidjs/Button";
import Dialog from "rocksolidjs/Dialog";
import Select from "rocksolidjs/Select";
import Tab from "rocksolidjs/Tab";
import Tabs from "rocksolidjs/Tabs";
import TabsContext from "rocksolidjs/TabsContext";
import ThemeProvider from "rocksolidjs/ThemeProvider";
import { useThemeContext } from "@/components/ThemeProvider/ThemeContext";
import defaultTheme from "@/components/styles/theme";
export { default as createTheme } from "@/components/styles/createTheme";

function ThemeValue() {
  const context = useThemeContext();
  return <output id="theme-value">{context?.theme.focus}</output>;
}

function Example() {
  const [extraCrumb, setExtraCrumb] = createSignal(false);
  const [selection, setSelection] = createSignal("missing");
  const [alternateTheme, setAlternateTheme] = createSignal(false);
  const [firstOpen, setFirstOpen] = createSignal(false);
  const [secondOpen, setSecondOpen] = createSignal(false);
  const [imageError, setImageError] = createSignal("");
  const [ariaDisabled, setAriaDisabled] = createSignal(true);
  return <>
    <Accordion accordionId="test" disableTransition>
      <AccordionSummary>Toggle accordion</AccordionSummary>
      <AccordionDetails><button>Panel action</button></AccordionDetails>
    </Accordion>
    <Avatar src="/one" alt="Ada Lovelace" slotProps={{ img: { title: "no callback" } }} />
    <Avatar src="/two" alt="Grace Hopper" slotProps={{ img: { onError: [value => setImageError(value), "tuple"] } }} />
    <output id="image-error">{imageError()}</output>
    <button id="add-crumb" onClick={() => setExtraCrumb(true)}>Add crumb</button>
    <Breadcrumbs aria-label="Breadcrumb"><span>First</span><Show when={extraCrumb()}><span>Second</span></Show></Breadcrumbs>
    <Select id="uncontrolled" options={[{ label: "First", value: "one" }, { label: "Second", value: "two" }]} />
    <button id="toggle-aria-disabled" onClick={() => setAriaDisabled(value => !value)}>Toggle disabled</button>
    <TabsContext>
      <Tabs id="no-selection" orientation="vertical">
        <Tab aria-disabled={ariaDisabled() ? "true" : "false"} value="aria-disabled" label="Aria disabled" />
        <Tab disabled value="disabled" label="Disabled" />
        <Tab value="first" label="First" />
        <Tab value="second" label="Second" />
      </Tabs>
    </TabsContext>
    <button id="choose-tab" onClick={() => setSelection("second")}>Choose tab</button>
    <TabsContext value={selection()}>
      <Tabs id="rtl-tabs" style={{ direction: "rtl" }}>
        <Tab value="first" label="First" />
        <Tab value="second" label="Second" />
      </Tabs>
    </TabsContext>
    <button id="change-theme" onClick={() => setAlternateTheme(value => !value)}>Change theme</button>
    <ThemeProvider theme={{ ...defaultTheme, focus: alternateTheme() ? "test-focus-b" : "test-focus-a" }}>
      <Button id="themed">Themed</Button><ThemeValue />
    </ThemeProvider>
    <button id="first-dialog" onClick={() => setFirstOpen(value => !value)}>First dialog</button>
    <button id="second-dialog" onClick={() => setSecondOpen(value => !value)}>Second dialog</button>
    <Dialog open={firstOpen()}>First dialog content</Dialog>
    <Dialog open={secondOpen()}>Second dialog content</Dialog>
  </>;
}

export function mount(target: HTMLElement) { return render(() => <Example />, target); }
