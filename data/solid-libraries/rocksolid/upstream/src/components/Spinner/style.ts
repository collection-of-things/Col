import { tv } from "tailwind-variants";
import asVariants from "@/components/utils/asVariant";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const spinner = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: "inline-flex items-center justify-center",
    svg: "animate-spin",
  },
  variants: {
    color: asVariants(theme.colors, (config) => ({
      base: config.ghost.text,
    })),
    size: {
      small: {
        svg: "size-4",
      },
      medium: {
        svg: "size-6",
      },
      large: {
        svg: "size-8",
      },
    },
  },
});

export default spinner();