import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const tableRow = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "text-inherit align-middle",
    "[&_th]:border-b",
    "[&:not(:last-child)>td]:border-b",
  ],
  variants: {
    selected: {
      true: [
        theme.colors.default.filled.background,
      ],
      false: "",
    },
  },
});

export default tableRow();