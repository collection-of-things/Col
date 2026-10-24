/** Fixed examples compose the actual published exports. They do not implement
 * library widgets. Versions and exports are checked against official npm tarballs;
 * each component's canonical documentation is recorded in data/components.ts. */
export type PackageRecipe = {
  package: string;
  version: string;
  exportName: string;
  imports: string;
  jsx: string;
  setup?: string;
  stylesheets?: string[];
  compileCss?: string;
  gaps: string[];
};

const unstyled = "This library supplies unstyled primitives. Its actual interaction and accessibility behavior is included; documentation example CSS is not. Supply your application's CSS to reproduce its appearance.";
const providerTheme = "The library's default provider theme is used with the requested color scheme. Application-specific provider configuration is not imported.";

function recipe(packageName: string, version: string, names: string, jsx: string, gaps: string[] = [], extra: Partial<Pick<PackageRecipe, "setup" | "stylesheets" | "compileCss">> = {}): PackageRecipe {
  return { package: packageName, version, exportName: names.split(",")[0].trim(), imports: `import { ${names} } from ${JSON.stringify(`${packageName}@${version}`)};`, jsx, gaps, ...extra };
}
const base = (names: string, jsx: string) => recipe("@base-ui/react", "1.9.0", names, jsx, [unstyled]);
const aria = (names: string, jsx: string) => recipe("react-aria-components", "1.22.1", names, jsx, [unstyled]);
const ark = (names: string, jsx: string) => recipe("@ark-ui/react", "5.39.3", names, jsx, [unstyled]);
const headless = (names: string, jsx: string, setup?: string) => {
  const entry = recipe("@headlessui/react", "2.2.10", names, jsx, [unstyled], { setup });
  if (setup) entry.imports += '\nimport { useState } from "react";';
  return entry;
};
const mui = (names: string, jsx: string) => recipe("@mui/material", "9.5.0", `${names}, ThemeProvider, createTheme`, `<ThemeProvider theme={createTheme({ palette: { mode: PREVIEW_THEME } })}>${jsx}</ThemeProvider>`, [providerTheme]);
const chakra = (names: string, jsx: string, setup?: string) => recipe("@chakra-ui/react", "3.37.0", `${names}, ChakraProvider, defaultSystem`, `<ChakraProvider value={defaultSystem}>${jsx}</ChakraProvider>`, [providerTheme], { setup });
const hero = (names: string, jsx: string) => recipe("@heroui/react", "3.2.6", names, jsx, ["The published HeroUI v3 styles are compiled with Tailwind v4. Your application's custom Tailwind configuration and design tokens are not imported."], { compileCss: "@heroui/styles@3.2.6" });
const mantine = (names: string, jsx: string) => recipe("@mantine/core", "9.7.1", `${names}, MantineProvider`, `<MantineProvider forceColorScheme={PREVIEW_THEME}>${jsx}</MantineProvider>`, [providerTheme], { stylesheets: ["@mantine/core@9.7.1/styles.css"] });
const radix = (names: string, jsx: string) => recipe("radix-ui", "1.6.7", names, jsx, [unstyled]);
const webAwesome = (names: string, jsx: string): PackageRecipe => ({
  package: "@awesome.me/webawesome", version: "3.14.0", exportName: names.split(",")[0].trim(), jsx,
  imports: names.split(",").map((value) => {
    const name = value.trim();
    const slug = name.slice(2).replace(/[A-Z]/g, (letter, index) => (index ? "-" : "") + letter.toLowerCase());
    return `import ${name} from "@awesome.me/webawesome@3.14.0/dist/react/${slug}/index.js";`;
  }).join("\n"),
  setup: 'document.documentElement.classList.add(PREVIEW_THEME === "dark" ? "wa-dark" : "wa-light");',
  stylesheets: ["@awesome.me/webawesome@3.14.0/dist/styles/webawesome.css"],
  gaps: ["Uses the published React wrappers around Web Awesome custom elements and the default Web Awesome theme. Shadow DOM styling requires the library's CSS custom properties or ::part selectors; ordinary descendant selectors cannot reach component internals. Pro themes and app-specific icons are not included."],
});

export const packageRecipes: Readonly<Record<string, PackageRecipe>> = {
  "web-awesome/Button": webAwesome("WaButton", '<WaButton>Button</WaButton>'),
  "web-awesome/Input": webAwesome("WaInput", '<WaInput label="Name" placeholder="Enter a name" />'),
  "web-awesome/Dialog": webAwesome("WaDialog, WaButton", '<><WaDialog id="preview-dialog" label="Example dialog">Sample content<WaButton slot="footer" data-dialog="close">Close</WaButton></WaDialog><WaButton data-dialog="open preview-dialog">Open dialog</WaButton></>'),
  "web-awesome/Drawer": webAwesome("WaDrawer, WaButton", '<><WaDrawer id="preview-drawer" label="Example drawer">Sample content<WaButton slot="footer" data-drawer="close">Close</WaButton></WaDrawer><WaButton data-drawer="open preview-drawer">Open drawer</WaButton></>'),
  "web-awesome/Select": webAwesome("WaSelect, WaOption", '<WaSelect label="Fruit"><WaOption value="apple">Apple</WaOption><WaOption value="pear">Pear</WaOption></WaSelect>'),
  "web-awesome/Tab Group": webAwesome("WaTabGroup, WaTab, WaTabPanel", '<WaTabGroup><WaTab panel="one">Overview</WaTab><WaTab panel="two">Details</WaTab><WaTabPanel name="one">Overview content</WaTabPanel><WaTabPanel name="two">Details content</WaTabPanel></WaTabGroup>'),

  "base-ui/Button": base("Button", '<Button>Button</Button>'),
  "base-ui/Input": base("Input", '<Input aria-label="Name" placeholder="Enter a name" />'),
  "base-ui/Checkbox": base("Checkbox", '<label><Checkbox.Root><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Root>Accept terms</label>'),
  "base-ui/Switch": base("Switch", '<label><Switch.Root><Switch.Thumb /></Switch.Root>Notifications</label>'),
  "base-ui/Toggle": base("Toggle", '<Toggle aria-label="Bold">Bold</Toggle>'),
  "base-ui/Toggle Group": base("ToggleGroup, Toggle", '<ToggleGroup aria-label="Formatting"><Toggle value="bold">Bold</Toggle><Toggle value="italic">Italic</Toggle></ToggleGroup>'),
  "base-ui/Separator": base("Separator", '<><p>Before</p><Separator /><p>After</p></>'),
  "base-ui/Avatar": base("Avatar", '<Avatar.Root><Avatar.Fallback>AB</Avatar.Fallback></Avatar.Root>'),
  "base-ui/Collapsible": base("Collapsible", '<Collapsible.Root><Collapsible.Trigger>Show details</Collapsible.Trigger><Collapsible.Panel>Example details</Collapsible.Panel></Collapsible.Root>'),
  "base-ui/Accordion": base("Accordion", '<Accordion.Root><Accordion.Item value="one"><Accordion.Header><Accordion.Trigger>First question</Accordion.Trigger></Accordion.Header><Accordion.Panel>First answer</Accordion.Panel></Accordion.Item><Accordion.Item value="two"><Accordion.Header><Accordion.Trigger>Second question</Accordion.Trigger></Accordion.Header><Accordion.Panel>Second answer</Accordion.Panel></Accordion.Item></Accordion.Root>'),
  "base-ui/Tabs": base("Tabs", '<Tabs.Root defaultValue="one"><Tabs.List aria-label="Sections"><Tabs.Tab value="one">Overview</Tabs.Tab><Tabs.Tab value="two">Details</Tabs.Tab></Tabs.List><Tabs.Panel value="one">Overview content</Tabs.Panel><Tabs.Panel value="two">Details content</Tabs.Panel></Tabs.Root>'),
  "base-ui/Field": base("Field", '<Field.Root><Field.Label>Name</Field.Label><Field.Control placeholder="Enter a name" /><Field.Description>Your display name</Field.Description></Field.Root>'),
  "base-ui/Fieldset": base("Fieldset, Field", '<Fieldset.Root><Fieldset.Legend>Profile</Fieldset.Legend><Field.Root><Field.Label>Name</Field.Label><Field.Control /></Field.Root></Fieldset.Root>'),
  "base-ui/Number Field": base("NumberField", '<NumberField.Root defaultValue={2} min={0}><label htmlFor="preview-number">Quantity</label><NumberField.Group><NumberField.Decrement aria-label="Decrease">−</NumberField.Decrement><NumberField.Input id="preview-number" /><NumberField.Increment aria-label="Increase">+</NumberField.Increment></NumberField.Group></NumberField.Root>'),
  "base-ui/Radio Group": base("RadioGroup, Radio", '<RadioGroup aria-label="Plan" defaultValue="basic"><label><Radio.Root value="basic"><Radio.Indicator>●</Radio.Indicator></Radio.Root>Basic</label><label><Radio.Root value="pro"><Radio.Indicator>●</Radio.Indicator></Radio.Root>Pro</label></RadioGroup>'),
  "base-ui/Dialog": base("Dialog", '<Dialog.Root><Dialog.Trigger>Open dialog</Dialog.Trigger><Dialog.Portal><Dialog.Backdrop /><Dialog.Popup><Dialog.Title>Example dialog</Dialog.Title><Dialog.Description>Sample content</Dialog.Description><Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Portal></Dialog.Root>'),
  "base-ui/Popover": base("Popover", '<Popover.Root><Popover.Trigger>Open popover</Popover.Trigger><Popover.Portal><Popover.Positioner><Popover.Popup><Popover.Title>Example popover</Popover.Title><Popover.Description>Sample content</Popover.Description><Popover.Close>Close</Popover.Close></Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>'),
  "base-ui/Progress": base("Progress", '<Progress.Root value={65}><Progress.Label>Upload</Progress.Label><Progress.Value /><Progress.Track><Progress.Indicator /></Progress.Track></Progress.Root>'),
  "base-ui/Meter": base("Meter", '<Meter.Root value={65}><Meter.Label>Storage</Meter.Label><Meter.Value /><Meter.Track><Meter.Indicator /></Meter.Track></Meter.Root>'),
  "base-ui/Slider": base("Slider", '<Slider.Root defaultValue={40}><Slider.Control><Slider.Track><Slider.Indicator /><Slider.Thumb aria-label="Volume" /></Slider.Track></Slider.Control></Slider.Root>'),

  "react-aria/Button": aria("Button", '<Button>Button</Button>'),
  "react-aria/Checkbox": aria("Checkbox", '<Checkbox>Accept terms</Checkbox>'),
  "react-aria/CheckboxGroup": aria("CheckboxGroup, Label, Checkbox", '<CheckboxGroup><Label>Interests</Label><Checkbox value="design">Design</Checkbox><Checkbox value="code">Code</Checkbox></CheckboxGroup>'),
  "react-aria/Switch": aria("Switch", '<Switch>Notifications</Switch>'),
  "react-aria/TextField": aria("TextField, Label, Input", '<TextField><Label>Name</Label><Input placeholder="Enter a name" /></TextField>'),
  "react-aria/SearchField": aria("SearchField, Label, Input, Button", '<SearchField><Label>Search</Label><Input /><Button>Clear</Button></SearchField>'),
  "react-aria/NumberField": aria("NumberField, Label, Group, Button, Input", '<NumberField defaultValue={2} minValue={0}><Label>Quantity</Label><Group><Button slot="decrement">−</Button><Input /><Button slot="increment">+</Button></Group></NumberField>'),
  "react-aria/RadioGroup": aria("RadioGroup, Label, Radio", '<RadioGroup defaultValue="basic"><Label>Plan</Label><Radio value="basic">Basic</Radio><Radio value="pro">Pro</Radio></RadioGroup>'),
  "react-aria/ToggleButton": aria("ToggleButton", '<ToggleButton>Bold</ToggleButton>'),
  "react-aria/ToggleButtonGroup": aria("ToggleButtonGroup, ToggleButton", '<ToggleButtonGroup aria-label="Formatting"><ToggleButton id="bold">Bold</ToggleButton><ToggleButton id="italic">Italic</ToggleButton></ToggleButtonGroup>'),
  "react-aria/Tabs": aria("Tabs, TabList, Tab, TabPanel", '<Tabs><TabList aria-label="Sections"><Tab id="one">Overview</Tab><Tab id="two">Details</Tab></TabList><TabPanel id="one">Overview content</TabPanel><TabPanel id="two">Details content</TabPanel></Tabs>'),
  "react-aria/ListBox": aria("ListBox, ListBoxItem", '<ListBox aria-label="Fruit" selectionMode="single"><ListBoxItem id="apple">Apple</ListBoxItem><ListBoxItem id="pear">Pear</ListBoxItem><ListBoxItem id="orange">Orange</ListBoxItem></ListBox>'),
  "react-aria/GridList": aria("GridList, GridListItem", '<GridList aria-label="Items" selectionMode="single"><GridListItem id="one">First item</GridListItem><GridListItem id="two">Second item</GridListItem></GridList>'),
  "react-aria/Select": aria("Select, Label, Button, SelectValue, Popover, ListBox, ListBoxItem", '<Select><Label>Fruit</Label><Button><SelectValue /></Button><Popover><ListBox><ListBoxItem id="apple">Apple</ListBoxItem><ListBoxItem id="pear">Pear</ListBoxItem></ListBox></Popover></Select>'),
  "react-aria/ComboBox": aria("ComboBox, Label, Input, Button, Popover, ListBox, ListBoxItem", '<ComboBox><Label>Fruit</Label><Input /><Button>Show options</Button><Popover><ListBox><ListBoxItem id="apple">Apple</ListBoxItem><ListBoxItem id="pear">Pear</ListBoxItem></ListBox></Popover></ComboBox>'),
  "react-aria/Menu": aria("Menu, MenuTrigger, Button, Popover, MenuItem", '<MenuTrigger><Button>Actions</Button><Popover><Menu><MenuItem id="copy">Copy</MenuItem><MenuItem id="paste">Paste</MenuItem></Menu></Popover></MenuTrigger>'),
  "react-aria/Modal": aria("Modal, DialogTrigger, Dialog, Heading, Button", '<DialogTrigger><Button>Open dialog</Button><Modal><Dialog><Heading slot="title">Example dialog</Heading><p>Sample content</p><Button slot="close">Close</Button></Dialog></Modal></DialogTrigger>'),
  "react-aria/Popover": aria("Popover, DialogTrigger, Dialog, Heading, Button", '<DialogTrigger><Button>Open popover</Button><Popover><Dialog><Heading slot="title">Example popover</Heading><p>Sample content</p></Dialog></Popover></DialogTrigger>'),
  "react-aria/Tooltip": aria("Tooltip, TooltipTrigger, Button", '<TooltipTrigger delay={0}><Button>Hover or focus</Button><Tooltip>Example tooltip</Tooltip></TooltipTrigger>'),
  "react-aria/Disclosure": aria("Disclosure, Heading, Button, DisclosurePanel", '<Disclosure><Heading><Button slot="trigger">Show details</Button></Heading><DisclosurePanel>Example details</DisclosurePanel></Disclosure>'),
  "react-aria/Separator": aria("Separator", '<><p>Before</p><Separator /><p>After</p></>'),
  "react-aria/ProgressBar": aria("ProgressBar, Label", '<ProgressBar value={65}><Label>Upload</Label><span>65%</span></ProgressBar>'),
  "react-aria/Meter": aria("Meter, Label", '<Meter value={65}><Label>Storage</Label><span>65%</span></Meter>'),
  "react-aria/Slider": aria("Slider, Label, SliderOutput, SliderTrack, SliderThumb", '<Slider defaultValue={40}><Label>Volume</Label><SliderOutput /><SliderTrack><SliderThumb /></SliderTrack></Slider>'),
  "react-aria/Table": aria("Table, TableHeader, Column, TableBody, Row, Cell", '<Table aria-label="Sample data"><TableHeader><Column isRowHeader>Name</Column><Column>Role</Column></TableHeader><TableBody><Row id="one"><Cell>Alex</Cell><Cell>Designer</Cell></Row><Row id="two"><Cell>Sam</Cell><Cell>Developer</Cell></Row></TableBody></Table>'),
  "react-aria/Group": aria("Group, Button", '<Group aria-label="Actions"><Button>Save</Button><Button>Cancel</Button></Group>'),
  "react-aria/Link": aria("Link", '<Link href="#preview">Example link</Link>'),
  "react-aria/Breadcrumbs": aria("Breadcrumbs, Breadcrumb, Link", '<Breadcrumbs><Breadcrumb><Link href="#home">Home</Link></Breadcrumb><Breadcrumb><Link href="#current">Current page</Link></Breadcrumb></Breadcrumbs>'),
  "react-aria/ColorSwatch": aria("ColorSwatch", '<ColorSwatch color="#2563eb" aria-label="Blue" style={{ width: 48, height: 48 }} />'),

  "ark-ui/Checkbox": ark("Checkbox", '<Checkbox.Root><Checkbox.Control><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Control><Checkbox.Label>Accept terms</Checkbox.Label><Checkbox.HiddenInput /></Checkbox.Root>'),
  "ark-ui/Switch": ark("Switch", '<Switch.Root><Switch.Control><Switch.Thumb /></Switch.Control><Switch.Label>Notifications</Switch.Label><Switch.HiddenInput /></Switch.Root>'),
  "ark-ui/Avatar": ark("Avatar", '<Avatar.Root><Avatar.Fallback>AB</Avatar.Fallback></Avatar.Root>'),
  "ark-ui/Collapsible": ark("Collapsible", '<Collapsible.Root><Collapsible.Trigger>Show details</Collapsible.Trigger><Collapsible.Content>Example details</Collapsible.Content></Collapsible.Root>'),
  "ark-ui/Accordion": ark("Accordion", '<Accordion.Root collapsible><Accordion.Item value="one"><Accordion.ItemTrigger>First question</Accordion.ItemTrigger><Accordion.ItemContent>First answer</Accordion.ItemContent></Accordion.Item><Accordion.Item value="two"><Accordion.ItemTrigger>Second question</Accordion.ItemTrigger><Accordion.ItemContent>Second answer</Accordion.ItemContent></Accordion.Item></Accordion.Root>'),
  "ark-ui/Tabs": ark("Tabs", '<Tabs.Root defaultValue="one"><Tabs.List><Tabs.Trigger value="one">Overview</Tabs.Trigger><Tabs.Trigger value="two">Details</Tabs.Trigger></Tabs.List><Tabs.Content value="one">Overview content</Tabs.Content><Tabs.Content value="two">Details content</Tabs.Content></Tabs.Root>'),
  "ark-ui/Field": ark("Field", '<Field.Root><Field.Label>Name</Field.Label><Field.Input placeholder="Enter a name" /><Field.HelperText>Your display name</Field.HelperText></Field.Root>'),
  "ark-ui/Fieldset": ark("Fieldset, Field", '<Fieldset.Root><Fieldset.Legend>Profile</Fieldset.Legend><Field.Root><Field.Label>Name</Field.Label><Field.Input /></Field.Root></Fieldset.Root>'),
  "ark-ui/Number Input": ark("NumberInput", '<NumberInput.Root defaultValue="2" min={0}><NumberInput.Label>Quantity</NumberInput.Label><NumberInput.Control><NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger><NumberInput.Input /><NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger></NumberInput.Control></NumberInput.Root>'),
  "ark-ui/Radio Group": ark("RadioGroup", '<RadioGroup.Root defaultValue="basic"><RadioGroup.Label>Plan</RadioGroup.Label>{["basic", "pro"].map(value => <RadioGroup.Item key={value} value={value}><RadioGroup.ItemControl /><RadioGroup.ItemText>{value}</RadioGroup.ItemText><RadioGroup.ItemHiddenInput /></RadioGroup.Item>)}</RadioGroup.Root>'),
  "ark-ui/Dialog": ark("Dialog, Portal", '<Dialog.Root><Dialog.Trigger>Open dialog</Dialog.Trigger><Portal><Dialog.Backdrop /><Dialog.Positioner><Dialog.Content><Dialog.Title>Example dialog</Dialog.Title><Dialog.Description>Sample content</Dialog.Description><Dialog.CloseTrigger>Close</Dialog.CloseTrigger></Dialog.Content></Dialog.Positioner></Portal></Dialog.Root>'),
  "ark-ui/Popover": ark("Popover, Portal", '<Popover.Root><Popover.Trigger>Open popover</Popover.Trigger><Portal><Popover.Positioner><Popover.Content><Popover.Title>Example popover</Popover.Title><Popover.Description>Sample content</Popover.Description><Popover.CloseTrigger>Close</Popover.CloseTrigger></Popover.Content></Popover.Positioner></Portal></Popover.Root>'),
  "ark-ui/Slider": ark("Slider", '<Slider.Root defaultValue={[40]}><Slider.Label>Volume</Slider.Label><Slider.ValueText /><Slider.Control><Slider.Track><Slider.Range /></Slider.Track><Slider.Thumb index={0}><Slider.HiddenInput /></Slider.Thumb></Slider.Control></Slider.Root>'),
  "ark-ui/Rating Group": ark("RatingGroup", '<RatingGroup.Root count={5} defaultValue={3}><RatingGroup.Label>Rating</RatingGroup.Label><RatingGroup.Control>{[1,2,3,4,5].map(value => <RatingGroup.Item key={value} index={value}>★</RatingGroup.Item>)}</RatingGroup.Control><RatingGroup.HiddenInput /></RatingGroup.Root>'),
  "ark-ui/Editable": ark("Editable", '<Editable.Root defaultValue="Example name"><Editable.Label>Name</Editable.Label><Editable.Area><Editable.Input /><Editable.Preview /></Editable.Area></Editable.Root>'),
  "ark-ui/Progress - Linear": ark("Progress", '<Progress.Root value={65}><Progress.Label>Upload</Progress.Label><Progress.ValueText /><Progress.Track><Progress.Range /></Progress.Track></Progress.Root>'),

  "headless-ui/Button": headless("Button", '<Button>Button</Button>'),
  "headless-ui/Input": headless("Input", '<Input aria-label="Name" placeholder="Enter a name" />'),
  "headless-ui/Textarea": headless("Textarea", '<Textarea aria-label="Message" placeholder="Enter a message" />'),
  "headless-ui/Checkbox": headless("Checkbox, Field, Label", '<Field><Checkbox>✓</Checkbox><Label>Accept terms</Label></Field>'),
  "headless-ui/Switch": headless("Switch, Field, Label", '<Field><Switch>Toggle</Switch><Label>Notifications</Label></Field>'),
  "headless-ui/Select": headless("Select", '<Select aria-label="Fruit"><option>Apple</option><option>Pear</option></Select>'),
  "headless-ui/Fieldset": headless("Fieldset, Legend, Field, Label, Input", '<Fieldset><Legend>Profile</Legend><Field><Label>Name</Label><Input /></Field></Fieldset>'),
  "headless-ui/Disclosure": headless("Disclosure, DisclosureButton, DisclosurePanel", '<Disclosure><DisclosureButton>Show details</DisclosureButton><DisclosurePanel>Example details</DisclosurePanel></Disclosure>'),
  "headless-ui/Dropdown Menu": headless("Menu, MenuButton, MenuItems, MenuItem", '<Menu><MenuButton>Actions</MenuButton><MenuItems anchor="bottom"><MenuItem><button>Copy</button></MenuItem><MenuItem><button>Paste</button></MenuItem></MenuItems></Menu>'),
  "headless-ui/Popover": headless("Popover, PopoverButton, PopoverPanel", '<Popover><PopoverButton>Open popover</PopoverButton><PopoverPanel anchor="bottom">Example popover</PopoverPanel></Popover>'),
  "headless-ui/Tabs": headless("TabGroup, TabList, Tab, TabPanels, TabPanel", '<TabGroup><TabList><Tab>Overview</Tab><Tab>Details</Tab></TabList><TabPanels><TabPanel>Overview content</TabPanel><TabPanel>Details content</TabPanel></TabPanels></TabGroup>'),
  "headless-ui/Listbox": headless("Listbox, ListboxButton, ListboxOptions, ListboxOption", '<Listbox defaultValue="Apple"><ListboxButton>{({value}) => value}</ListboxButton><ListboxOptions anchor="bottom"><ListboxOption value="Apple">Apple</ListboxOption><ListboxOption value="Pear">Pear</ListboxOption></ListboxOptions></Listbox>'),
  "headless-ui/Radio Group": headless("RadioGroup, Radio, Field, Label", '<RadioGroup defaultValue="basic" aria-label="Plan"><Field><Radio value="basic">●</Radio><Label>Basic</Label></Field><Field><Radio value="pro">●</Radio><Label>Pro</Label></Field></RadioGroup>'),
  "headless-ui/Combobox": headless("Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption", '<Combobox defaultValue="Apple"><ComboboxInput aria-label="Fruit" /><ComboboxButton>Show options</ComboboxButton><ComboboxOptions anchor="bottom"><ComboboxOption value="Apple">Apple</ComboboxOption><ComboboxOption value="Pear">Pear</ComboboxOption></ComboboxOptions></Combobox>'),
  "headless-ui/Dialog": headless("Dialog, DialogPanel, DialogTitle, Description", '<PreviewDialog />', 'function PreviewDialog(){ const [open,setOpen]=useState(false);return <><button onClick={()=>setOpen(true)}>Open dialog</button><Dialog open={open} onClose={()=>setOpen(false)}><DialogPanel><DialogTitle>Example dialog</DialogTitle><Description>Sample content</Description><button onClick={()=>setOpen(false)}>Close</button></DialogPanel></Dialog></>; }'),
  "headless-ui/Transition": headless("Transition", '<PreviewTransition />', 'function PreviewTransition(){ const [show,setShow]=useState(true);return <><button onClick={()=>setShow(!show)}>Toggle content</button><Transition show={show}><div>Example content</div></Transition></>; }'),

  "mui/Button": mui("Button", '<Button variant="contained">Button</Button>'),
  "mui/ButtonGroup": mui("ButtonGroup, Button", '<ButtonGroup><Button>One</Button><Button>Two</Button></ButtonGroup>'),
  "mui/Checkbox": mui("Checkbox, FormControlLabel", '<FormControlLabel control={<Checkbox />} label="Accept terms" />'),
  "mui/Switch": mui("Switch, FormControlLabel", '<FormControlLabel control={<Switch />} label="Notifications" />'),
  "mui/TextField": mui("TextField", '<TextField label="Name" placeholder="Enter a name" />'),
  "mui/Autocomplete": mui("Autocomplete, TextField", '<Autocomplete options={["Apple", "Pear", "Orange"]} renderInput={params=><TextField {...params} label="Fruit" />} />'),
  "mui/RadioGroup": mui("RadioGroup, Radio, FormControlLabel", '<RadioGroup aria-label="Plan" defaultValue="basic"><FormControlLabel value="basic" control={<Radio />} label="Basic" /><FormControlLabel value="pro" control={<Radio />} label="Pro" /></RadioGroup>'),
  "mui/Rating": mui("Rating", '<Rating name="rating" defaultValue={3} />'),
  "mui/Slider": mui("Slider", '<Slider aria-label="Volume" defaultValue={40} />'),
  "mui/Select": mui("Select, MenuItem", '<Select defaultValue="apple" inputProps={{"aria-label":"Fruit"}}><MenuItem value="apple">Apple</MenuItem><MenuItem value="pear">Pear</MenuItem></Select>'),
  "mui/NativeSelect": mui("NativeSelect", '<NativeSelect defaultValue="apple" inputProps={{"aria-label":"Fruit"}}><option value="apple">Apple</option><option value="pear">Pear</option></NativeSelect>'),
  "mui/Alert": mui("Alert", '<Alert severity="info">Sample notification</Alert>'),
  "mui/Card": mui("Card, CardContent, Typography", '<Card><CardContent><Typography variant="h6">Example card</Typography><Typography>Sample content</Typography></CardContent></Card>'),
  "mui/Chip": mui("Chip", '<Chip label="Example chip" />'),
  "mui/Avatar": mui("Avatar", '<Avatar>AB</Avatar>'),
  "mui/AvatarGroup": mui("AvatarGroup, Avatar", '<AvatarGroup><Avatar>AB</Avatar><Avatar>CD</Avatar></AvatarGroup>'),
  "mui/Badge": mui("Badge, Button", '<Badge badgeContent={4} color="primary"><Button>Inbox</Button></Badge>'),
  "mui/Divider": mui("Divider", '<><p>Before</p><Divider /><p>After</p></>'),
  "mui/Typography": mui("Typography", '<Typography variant="h4">Example heading</Typography>'),
  "mui/LinearProgress": mui("LinearProgress", '<LinearProgress variant="determinate" value={65} aria-label="Upload" />'),
  "mui/CircularProgress": mui("CircularProgress", '<CircularProgress variant="determinate" value={65} aria-label="Upload" />'),
  "mui/Skeleton": mui("Skeleton", '<Skeleton variant="rectangular" width={210} height={80} animation={false} />'),
  "mui/Paper": mui("Paper", '<Paper>Sample content</Paper>'),
  "mui/Accordion": mui("Accordion, AccordionSummary, AccordionDetails", '<Accordion><AccordionSummary>Show details</AccordionSummary><AccordionDetails>Example details</AccordionDetails></Accordion>'),
  "mui/Tooltip": mui("Tooltip, Button", '<Tooltip title="Example tooltip"><Button>Hover or focus</Button></Tooltip>'),
  "mui/Pagination": mui("Pagination", '<Pagination count={10} aria-label="Pages" />'),
  "mui/Breadcrumbs": mui("Breadcrumbs, Link, Typography", '<Breadcrumbs><Link href="#home">Home</Link><Typography>Current page</Typography></Breadcrumbs>'),
  "mui/Table": mui("Table, TableHead, TableRow, TableCell, TableBody", '<Table aria-label="Sample data"><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Role</TableCell></TableRow></TableHead><TableBody><TableRow><TableCell>Alex</TableCell><TableCell>Designer</TableCell></TableRow><TableRow><TableCell>Sam</TableCell><TableCell>Developer</TableCell></TableRow></TableBody></Table>'),
  "mui/Stack": mui("Stack, Button", '<Stack spacing={2}><Button>First</Button><Button>Second</Button></Stack>'),
  "mui/Box": mui("Box", '<Box>Sample content</Box>'),
  "mui/Container": mui("Container", '<Container>Sample content</Container>'),
  "mui/List": mui("List, ListItem, ListItemText", '<List><ListItem><ListItemText primary="First item" /></ListItem><ListItem><ListItemText primary="Second item" /></ListItem></List>'),

  "chakra-ui/Button": chakra("Button", '<Button>Button</Button>'),
  "chakra-ui/Dialog": chakra("Dialog", '<Dialog.Root><Dialog.Trigger>Open dialog</Dialog.Trigger><Dialog.Backdrop /><Dialog.Positioner><Dialog.Content><Dialog.Header><Dialog.Title>Example dialog</Dialog.Title></Dialog.Header><Dialog.Body>Sample content</Dialog.Body><Dialog.CloseTrigger>Close</Dialog.CloseTrigger></Dialog.Content></Dialog.Positioner></Dialog.Root>'),
  "chakra-ui/Menu": chakra("Menu", '<Menu.Root><Menu.Trigger>Actions</Menu.Trigger><Menu.Positioner><Menu.Content><Menu.Item value="copy">Copy</Menu.Item><Menu.Item value="paste">Paste</Menu.Item></Menu.Content></Menu.Positioner></Menu.Root>'),
  "chakra-ui/Tabs": chakra("Tabs", '<Tabs.Root defaultValue="one"><Tabs.List><Tabs.Trigger value="one">Overview</Tabs.Trigger><Tabs.Trigger value="two">Details</Tabs.Trigger></Tabs.List><Tabs.Content value="one">Overview content</Tabs.Content><Tabs.Content value="two">Details content</Tabs.Content></Tabs.Root>'),
  "chakra-ui/Table": chakra("Table", '<Table.Root><Table.Header><Table.Row><Table.ColumnHeader>Name</Table.ColumnHeader><Table.ColumnHeader>Role</Table.ColumnHeader></Table.Row></Table.Header><Table.Body><Table.Row><Table.Cell>Alex</Table.Cell><Table.Cell>Designer</Table.Cell></Table.Row><Table.Row><Table.Cell>Sam</Table.Cell><Table.Cell>Developer</Table.Cell></Table.Row></Table.Body></Table.Root>'),
  "chakra-ui/Slider": chakra("Slider", '<Slider.Root defaultValue={[40]}><Slider.Label>Volume</Slider.Label><Slider.ValueText /><Slider.Control><Slider.Track><Slider.Range /></Slider.Track><Slider.Thumb index={0}><Slider.HiddenInput /></Slider.Thumb></Slider.Control></Slider.Root>'),
  "chakra-ui/Select": chakra("Select, createListCollection", '<Select.Root collection={previewCollection}><Select.Label>Fruit</Select.Label><Select.HiddenSelect /><Select.Control><Select.Trigger><Select.ValueText placeholder="Choose fruit" /></Select.Trigger><Select.IndicatorGroup><Select.Indicator /></Select.IndicatorGroup></Select.Control><Select.Positioner><Select.Content>{previewCollection.items.map(item=><Select.Item item={item} key={item.value}>{item.label}<Select.ItemIndicator /></Select.Item>)}</Select.Content></Select.Positioner></Select.Root>', 'const previewCollection=createListCollection({items:[{label:"Apple",value:"apple"},{label:"Pear",value:"pear"}]});'),

  "heroui/Button": hero("Button", '<Button>Button</Button>'),
  "heroui/Input": hero("Input", '<Input aria-label="Name" placeholder="Enter a name" />'),
  "heroui/Text Area": hero("TextArea", '<TextArea aria-label="Message" placeholder="Enter a message" />'),
  "heroui/Checkbox": hero("Checkbox", '<Checkbox><Checkbox.Content><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>Accept terms</Checkbox.Content></Checkbox>'),
  "heroui/Switch": hero("Switch, Label", '<Switch><Switch.Control><Switch.Thumb /></Switch.Control><Switch.Content><Label>Notifications</Label></Switch.Content></Switch>'),
  "heroui/Card": hero("Card", '<Card><Card.Header><Card.Title>Example card</Card.Title><Card.Description>Sample description</Card.Description></Card.Header><Card.Content>Sample content</Card.Content></Card>'),
  "heroui/Avatar": hero("Avatar", '<Avatar><Avatar.Fallback>AB</Avatar.Fallback></Avatar>'),
  "heroui/Chip": hero("Chip", '<Chip>Example chip</Chip>'),
  "heroui/Label": hero("Label", '<Label>Example label</Label>'),
  "heroui/Description": hero("Description", '<Description>Example description</Description>'),
  "heroui/Separator": hero("Separator", '<><p>Before</p><Separator /><p>After</p></>'),
  "heroui/Link": hero("Link", '<Link href="#preview">Example link</Link>'),
  "heroui/Kbd": hero("Kbd", '<Kbd>⌘ K</Kbd>'),
  "heroui/Surface": hero("Surface", '<Surface>Sample content</Surface>'),
  "heroui/Toggle Button": hero("ToggleButton", '<ToggleButton>Bold</ToggleButton>'),

  "cmdk/Command": recipe("cmdk", "1.1.1", "Command", '<Command label="Command menu"><Command.Input placeholder="Search actions" /><Command.List><Command.Empty>No results</Command.Empty><Command.Group heading="Actions"><Command.Item>Copy</Command.Item><Command.Item>Paste</Command.Item><Command.Item>Print</Command.Item></Command.Group></Command.List></Command>', [unstyled]),

  "mantine/Accordion": mantine("Accordion", '<Accordion><Accordion.Item value="one"><Accordion.Control>First question</Accordion.Control><Accordion.Panel>First answer</Accordion.Panel></Accordion.Item><Accordion.Item value="two"><Accordion.Control>Second question</Accordion.Control><Accordion.Panel>Second answer</Accordion.Panel></Accordion.Item></Accordion>'),
  "mantine/Tabs": mantine("Tabs", '<Tabs defaultValue="one"><Tabs.List><Tabs.Tab value="one">Overview</Tabs.Tab><Tabs.Tab value="two">Details</Tabs.Tab></Tabs.List><Tabs.Panel value="one">Overview content</Tabs.Panel><Tabs.Panel value="two">Details content</Tabs.Panel></Tabs>'),
  "mantine/Select": mantine("Select", '<Select label="Fruit" data={["Apple", "Pear", "Orange"]} />'),
  "mantine/MultiSelect": mantine("MultiSelect", '<MultiSelect label="Fruit" data={["Apple", "Pear", "Orange"]} />'),
  "mantine/Autocomplete": mantine("Autocomplete", '<Autocomplete label="Fruit" data={["Apple", "Pear", "Orange"]} />'),
  "mantine/TagsInput": mantine("TagsInput", '<TagsInput label="Tags" defaultValue={["Design"]} data={["Design", "Code"]} />'),
  "mantine/NativeSelect": mantine("NativeSelect", '<NativeSelect label="Fruit" data={["Apple", "Pear", "Orange"]} />'),
  "mantine/NumberInput": mantine("NumberInput", '<NumberInput label="Quantity" defaultValue={2} min={0} />'),
  "mantine/PasswordInput": mantine("PasswordInput", '<PasswordInput label="Password" placeholder="Enter a password" />'),
  "mantine/Slider": mantine("Slider", '<Slider aria-label="Volume" defaultValue={40} />'),
  "mantine/RangeSlider": mantine("RangeSlider", '<RangeSlider aria-label="Range" defaultValue={[20,80]} />'),
  "mantine/Rating": mantine("Rating", '<Rating defaultValue={3} />'),
  "mantine/SegmentedControl": mantine("SegmentedControl", '<SegmentedControl data={["Overview", "Details"]} />'),
  "mantine/Radio": mantine("Radio", '<Radio.Group label="Plan" defaultValue="basic"><Radio value="basic" label="Basic" /><Radio value="pro" label="Pro" /></Radio.Group>'),
  "mantine/Chip": mantine("Chip", '<Chip>Example chip</Chip>'),
  "mantine/PinInput": mantine("PinInput", '<PinInput aria-label="Verification code" />'),
  "mantine/ColorInput": mantine("ColorInput", '<ColorInput label="Color" defaultValue="#2563eb" />'),
  "mantine/ColorPicker": mantine("ColorPicker", '<ColorPicker defaultValue="#2563eb" />'),
  "mantine/Avatar": mantine("Avatar", '<Avatar>AB</Avatar>'),
  "mantine/Progress": mantine("Progress", '<Progress value={65} aria-label="Upload" />'),
  "mantine/Pagination": mantine("Pagination", '<Pagination total={10} />'),
  "mantine/Tooltip": mantine("Tooltip, Button", '<Tooltip label="Example tooltip"><Button>Hover or focus</Button></Tooltip>'),
  "mantine/Popover": mantine("Popover, Button", '<Popover><Popover.Target><Button>Open popover</Button></Popover.Target><Popover.Dropdown>Example popover</Popover.Dropdown></Popover>'),
  "mantine/Menu": mantine("Menu, Button", '<Menu><Menu.Target><Button>Actions</Button></Menu.Target><Menu.Dropdown><Menu.Item>Copy</Menu.Item><Menu.Item>Paste</Menu.Item></Menu.Dropdown></Menu>'),
  "mantine/Table": mantine("Table", '<Table><Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>Role</Table.Th></Table.Tr></Table.Thead><Table.Tbody><Table.Tr><Table.Td>Alex</Table.Td><Table.Td>Designer</Table.Td></Table.Tr><Table.Tr><Table.Td>Sam</Table.Td><Table.Td>Developer</Table.Td></Table.Tr></Table.Tbody></Table>'),
  "mantine/Title": mantine("Title", '<Title order={2}>Example heading</Title>'),
  "mantine/Text": mantine("Text", '<Text>Sample text</Text>'),
  "mantine/Code": mantine("Code", '<Code>const example = true;</Code>'),
  "mantine/Kbd": mantine("Kbd", '<Kbd>⌘ K</Kbd>'),
  "mantine/Paper": mantine("Paper", '<Paper>Sample content</Paper>'),
  "mantine/Divider": mantine("Divider", '<><p>Before</p><Divider /><p>After</p></>'),
  "mantine/Fieldset": mantine("Fieldset, TextInput", '<Fieldset legend="Profile"><TextInput label="Name" /></Fieldset>'),

  "radix-ui/Accordion": radix("Accordion", '<Accordion.Root type="single" collapsible><Accordion.Item value="one"><Accordion.Header><Accordion.Trigger>First question</Accordion.Trigger></Accordion.Header><Accordion.Content>First answer</Accordion.Content></Accordion.Item><Accordion.Item value="two"><Accordion.Header><Accordion.Trigger>Second question</Accordion.Trigger></Accordion.Header><Accordion.Content>Second answer</Accordion.Content></Accordion.Item></Accordion.Root>'),
  "radix-ui/Avatar": radix("Avatar", '<Avatar.Root><Avatar.Fallback>AB</Avatar.Fallback></Avatar.Root>'),
  "radix-ui/Collapsible": radix("Collapsible", '<Collapsible.Root><Collapsible.Trigger>Show details</Collapsible.Trigger><Collapsible.Content>Example details</Collapsible.Content></Collapsible.Root>'),
  "radix-ui/Dropdown Menu": radix("DropdownMenu", '<DropdownMenu.Root><DropdownMenu.Trigger>Actions</DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content><DropdownMenu.Item>Copy</DropdownMenu.Item><DropdownMenu.Item>Paste</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>'),
  "radix-ui/Popover": radix("Popover", '<Popover.Root><Popover.Trigger>Open popover</Popover.Trigger><Popover.Portal><Popover.Content>Example popover<Popover.Close>Close</Popover.Close></Popover.Content></Popover.Portal></Popover.Root>'),
  "radix-ui/Tabs": radix("Tabs", '<Tabs.Root defaultValue="one"><Tabs.List aria-label="Sections"><Tabs.Trigger value="one">Overview</Tabs.Trigger><Tabs.Trigger value="two">Details</Tabs.Trigger></Tabs.List><Tabs.Content value="one">Overview content</Tabs.Content><Tabs.Content value="two">Details content</Tabs.Content></Tabs.Root>'),
  "radix-ui/Toggle": radix("Toggle", '<Toggle.Root aria-label="Bold">Bold</Toggle.Root>'),
  "radix-ui/Toggle Group": radix("ToggleGroup", '<ToggleGroup.Root type="multiple" aria-label="Formatting"><ToggleGroup.Item value="bold">Bold</ToggleGroup.Item><ToggleGroup.Item value="italic">Italic</ToggleGroup.Item></ToggleGroup.Root>'),
  "radix-ui/Separator": radix("Separator", '<><p>Before</p><Separator.Root /><p>After</p></>'),
  "radix-ui/Label": radix("Label", '<><Label.Root htmlFor="preview-name">Name</Label.Root><input id="preview-name" /></>'),
  "radix-ui/Slider": radix("Slider", '<Slider.Root defaultValue={[40]}><Slider.Track><Slider.Range /></Slider.Track><Slider.Thumb aria-label="Volume" /></Slider.Root>'),
  "radix-ui/Radio Group": radix("RadioGroup", '<RadioGroup.Root defaultValue="basic" aria-label="Plan"><label><RadioGroup.Item value="basic"><RadioGroup.Indicator>●</RadioGroup.Indicator></RadioGroup.Item>Basic</label><label><RadioGroup.Item value="pro"><RadioGroup.Indicator>●</RadioGroup.Indicator></RadioGroup.Item>Pro</label></RadioGroup.Root>'),
  "radix-ui/Progress": radix("Progress", '<Progress.Root value={65} aria-label="Upload"><Progress.Indicator />65%</Progress.Root>'),
  "radix-ui/Tooltip": radix("Tooltip", '<Tooltip.Provider delayDuration={0}><Tooltip.Root><Tooltip.Trigger>Hover or focus</Tooltip.Trigger><Tooltip.Portal><Tooltip.Content>Example tooltip</Tooltip.Content></Tooltip.Portal></Tooltip.Root></Tooltip.Provider>'),
};
