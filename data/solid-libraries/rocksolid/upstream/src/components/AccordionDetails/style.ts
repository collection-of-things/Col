import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const accordionDetails = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: [
      "overflow-hidden",
      theme.typography.colors.textPrimary,
    ],
    content: [
      "pt-2 pb-3 px-4",
      theme.typography.variants.body2,
    ],
  },
  variants: {
    disableTransition: {
      true: {},
      false: {
        base: "transition-[height] duration-300",
      },
    },
    expanded: {
      true: {
        base: "h-auto",
      },
      false: {
        base: "h-0",
      },
    },
  },
});

export default accordionDetails();