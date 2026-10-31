import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const tab = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "py-2 px-4 min-w-15 min-h-8",
    "items-center justify-center gap-y-0 gap-x-1",
    theme.rounded.none,
  ],
  variants: {
    iconPosition: {
      start: "flex-row",
      end: "flex-row-reverse",
      top: "flex-col",
      bottom: "flex-col-reverse",
    },
    orientation: {
      horizontal: "",
      vertical: "", 
    },
    selected: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      selected: true,
      class: "shadow-[inset_0_-2px_0_currentColor]",
    },
    {
      orientation: "vertical",
      selected: true,
      class: [
        "ltr:shadow-[inset_-2px_0px_0_currentColor]",
        "rtl:shadow-[inset_2px_0px_0_currentColor]",
      ],
    },
  ],
});

export default tab();