/** Verified public component families from quoin-ui's 0.6.0 export map. */
export const QUOIN_VERSION = "0.6.0";
export const SOLID_VERSION = "2.0.0-rc.18";
export const QUOIN_REVISION = "efff3191148c0af2f720d61f179d0689aac7a073";
export const QUOIN_SOURCE_URL = "https://git.cafe/versecafe/quoin";
export const QUOIN_VERIFIED_AT = "2026-10-28";

const families = [
  ["Accordion", "accordion", "Expandable sections with shared keyboard navigation."],
  ["Alert Dialog", "alert-dialog", "A modal confirmation dialog for an important decision."],
  ["Autocomplete", "autocomplete", "A text input with suggested completions."],
  ["Avatar", "avatar", "An image with loading and fallback content."],
  ["Button", "button", "An action control with disabled and focusable-disabled states."],
  ["Checkbox", "checkbox", "A checked or indeterminate selection control."],
  ["Checkbox Group", "checkbox-group", "A controlled collection of checkbox values."],
  ["Collapsible", "collapsible", "A trigger and expandable content region."],
  ["Combobox", "combobox", "An editable selection control with a popup list."],
  ["Context Menu", "context-menu", "A menu opened by a context-menu interaction."],
  ["CSP Provider", "csp-provider", "Configuration for Quoin's generated style nonces."],
  ["Dialog", "dialog", "A modal or nonmodal overlay with focus management."],
  ["Direction Provider", "direction-provider", "Shared left-to-right or right-to-left direction."],
  ["Drawer", "drawer", "An edge overlay with drawer interactions."],
  ["Field", "field", "A labeled form control with description and validation feedback."],
  ["Fieldset", "fieldset", "A labeled group of related form fields."],
  ["Form", "form", "A form coordinating field validation and submission."],
  ["Input", "input", "A text input integrated with Quoin field state."],
  ["Menu", "menu", "A menu with selectable items, groups, and nested submenus."],
  ["Menubar", "menubar", "A horizontal collection of menus with keyboard navigation."],
  ["Meter", "meter", "A measurement within a known range."],
  ["Navigation Menu", "navigation-menu", "Navigation links with expandable content."],
  ["Number Field", "number-field", "A numeric input with increment and decrement controls."],
  ["OTP Field", "otp-field", "A segmented one-time-code input."],
  ["Popover", "popover", "An anchored popup with controlled visibility."],
  ["Preview Card", "preview-card", "An anchored preview opened from a trigger."],
  ["Progress", "progress", "The progress of a task, including an indeterminate state."],
  ["Radio", "radio", "One selectable option within a radio group."],
  ["Radio Group", "radio-group", "A single selection shared across radio options."],
  ["Scroll Area", "scroll-area", "A scrollable viewport with customizable scrollbars."],
  ["Select", "select", "A controlled choice from a popup list of options."],
  ["Separator", "separator", "A semantic separator between content sections."],
  ["Slider", "slider", "A value or range selected along a track."],
  ["Switch", "switch", "A controlled on/off setting."],
  ["Tabs", "tabs", "A tab list controlling associated content panels."],
  ["Toast", "toast", "Temporary notifications managed by a provider and viewport."],
  ["Toggle", "toggle", "A button with a pressed state."],
  ["Toggle Group", "toggle-group", "A group of selectable toggle buttons."],
  ["Toolbar", "toolbar", "Related controls with shared keyboard navigation."],
  ["Tooltip", "tooltip", "A description displayed when a trigger is hovered or focused."],
] as const;

export const quoinComponents = families.map(([name, subpath, summary]) => ({
  name,
  subpath,
  summary,
  // Quoin publishes API references in its source; it has no separate component docs site.
  url: `${QUOIN_SOURCE_URL}/blob/${QUOIN_REVISION}/src/${subpath}/index.ts`,
}));
