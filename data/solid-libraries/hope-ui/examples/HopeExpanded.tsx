import { AlertColorSchemesDemo } from "../upstream/apps/docs/src/components/demos/alert/AlertColorSchemesDemo";
import { BadgeStatusDemo } from "../upstream/apps/docs/src/components/demos/badge/BadgeStatusDemo";
import { CalendarBasicDemo } from "../upstream/apps/docs/src/components/demos/calendar/CalendarBasicDemo";
import { CloseButtonSurfacesDemo } from "../upstream/apps/docs/src/components/demos/close-button/CloseButtonSurfacesDemo";
import { ComboboxBasicDemo } from "../upstream/apps/docs/src/components/demos/combobox/ComboboxBasicDemo";
import { ListboxBasicDemo } from "../upstream/apps/docs/src/components/demos/listbox/ListboxBasicDemo";
import { PopoverBasicDemo } from "../upstream/apps/docs/src/components/demos/popover/PopoverBasicDemo";
import { render } from "@solidjs/web";
import { ThemeProvider } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";
const examples = { "hope-ui/Alert": AlertColorSchemesDemo, "hope-ui/Badge": BadgeStatusDemo, "hope-ui/Calendar": CalendarBasicDemo, "hope-ui/CloseButton": CloseButtonSurfacesDemo, "hope-ui/Combobox": ComboboxBasicDemo, "hope-ui/Listbox": ListboxBasicDemo, "hope-ui/Popover": PopoverBasicDemo };
export default function mount(target) {
  const Demo = examples[PREVIEW_COMPONENT];
  if (!Demo) throw new Error("Unknown hope-ui example");
  return render(() => <ThemeProvider preset={hope}><Demo /></ThemeProvider>, target);
}
