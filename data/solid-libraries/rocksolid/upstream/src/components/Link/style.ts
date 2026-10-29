import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const link = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "block",
    theme.rounded.small,
    theme.focus,
  ],
  variants: {
    underline: {
      none: "no-underline",
      hover: "hover:underline",
      always: "underline",
    },
  },
});

export default link();