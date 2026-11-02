import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const accordion = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "border-t border-l border-r",
    "first-of-type:rounded-t-sm",
    "last-of-type:border-b",
    "last-of-type:rounded-b-sm",
    theme.divider,
  ],
});

export default accordion();