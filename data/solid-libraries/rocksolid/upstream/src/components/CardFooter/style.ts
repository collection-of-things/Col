import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const cardFooter = (
  _theme: Theme = defaultTheme,
) => tv({
  base: "flex items-center gap-2 px-4 pt-3 pb-4",
});

export default cardFooter();