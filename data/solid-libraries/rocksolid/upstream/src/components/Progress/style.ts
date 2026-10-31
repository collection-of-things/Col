import { tv } from "tailwind-variants";
import asVariants from "@/components/utils/asVariant";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const progress = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: [
      "block w-full overflow-hidden",
      "bg-neutral-300 dark:bg-neutral-700",
      theme.rounded.full,
    ],
    fill: [
      "block h-full rounded-[inherit]",
      "transition-[width] duration-150",
    ],
  },
  variants: {
    color: (
      asVariants(theme.colors, (config) => ({
        fill: [config.solid.background],
      }))
    ),
    size: {
      small: {
        base: "h-1",
      },
      medium: {
        base: "h-2",
      },
      large: {
        base: "h-4",
      },
    },
  },
});

export default progress();