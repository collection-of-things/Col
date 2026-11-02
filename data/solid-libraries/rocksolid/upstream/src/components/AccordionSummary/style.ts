import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const accordionSummary = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "px-3 h-full min-h-10 justify-between gap-2",
    "text-left rtl:text-right",
    theme.rounded.small,
  ],
});

export default accordionSummary();