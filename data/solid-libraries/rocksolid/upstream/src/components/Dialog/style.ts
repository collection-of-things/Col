import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const dialog = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "fixed min-w-xs shadow-sm z-2",
    "bg-white dark:bg-neutral-900",
    "dark:border",
    theme.divider,
  ],
  variants: {
    fullscreen: {
      true: "w-full h-full",
      false: [ 
        "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "max-w-[calc(100vw_-_2rem)] max-h-[calc(100vh_-_2rem)]",
        theme.rounded.small,
      ],
    },
  },
});

export default dialog();