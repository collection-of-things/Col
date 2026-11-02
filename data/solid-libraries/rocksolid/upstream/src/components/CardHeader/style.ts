import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const cardHeader = (
  _theme: Theme = defaultTheme,
) => tv({
  base: "px-4 pt-4 pb-2",
});

export default cardHeader();