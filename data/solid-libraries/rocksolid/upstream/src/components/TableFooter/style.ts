import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const tableFooter = (
  _theme: Theme = defaultTheme,
) => tv({
  base: "bg-neutral-100 dark:bg-neutral-900",
});

export default tableFooter();