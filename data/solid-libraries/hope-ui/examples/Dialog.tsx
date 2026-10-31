import { render } from "@solidjs/web";
import { ThemeProvider } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";
import { DialogBasicDemo } from "../upstream/apps/docs/src/components/demos/dialog/DialogBasicDemo";

export default function mount(target: HTMLElement) {
  return render(() => <ThemeProvider preset={hope}><DialogBasicDemo /></ThemeProvider>, target);
}
