import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const checkbox = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: [
      "relative",
      theme.focusWithin,
    ],
    input: "absolute inset-0 w-full h-full opacity-0 outline-none",
  },
  variants: {
    checked: {
      true: {},
      false: {},
    },
    disabled: {
      true: {
        base: [
          theme.disabled.state,
        ],
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      checked: false,
      disabled: false,
      class: {
        base: [
          theme.typography.colors.textTertiary,
        ],
      },
    },
  ],
});

export default checkbox();