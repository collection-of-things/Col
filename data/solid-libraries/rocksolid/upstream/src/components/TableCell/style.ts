import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const tableCell = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "text-inherit text-left align-[inherit]",
    theme.divider,
  ],
  variants: {
    dense: {
      true: "py-1.5 px-2",
      false: "py-3 px-3.5",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
  },
});

export default tableCell();