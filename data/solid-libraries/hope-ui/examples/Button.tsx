import { render } from "@solidjs/web";
import { ThemeProvider } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";
import { ButtonIconsDemo } from "../upstream/apps/docs/src/components/demos/button/ButtonIconsDemo";

export default function mount(target: HTMLElement) {
  return render(() => <ThemeProvider preset={hope}><ButtonIconsDemo /></ThemeProvider>, target);
}
