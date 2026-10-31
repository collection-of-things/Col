import { render } from "@solidjs/web";
import { ThemeProvider } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";
import { SelectBasicDemo } from "../upstream/apps/docs/src/components/demos/select/SelectBasicDemo";

export default function mount(target: HTMLElement) {
  return render(() => <ThemeProvider preset={hope}><SelectBasicDemo /></ThemeProvider>, target);
}
