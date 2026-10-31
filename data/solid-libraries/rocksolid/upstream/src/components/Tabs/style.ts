import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const tabs = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: [
      "relative flex items-stretch",
      theme.divider,
    ],
  },
  variants: {
    centered: {
      true: {},
      false: {},
    },
    orientation: {
      horizontal: {
        base: "flex-row border-b",
      },
      vertical: {
        base: "flex-col ltr:border-r rtl:border-l",
      },
    },
  },
  compoundVariants: [
    {
      centered: true, 
      orientation: "horizontal",
      class: {
        base: "justify-center",
      },
    },
    {
      centered: true, 
      orientation: "vertical",
      class: {
        base: "items-center",
      },
    },
  ],
});

export default tabs();