import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const skeleton = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "bg-neutral-200 dark:bg-neutral-800",
    "shrink-0",
    "animate-[fade_2.5s_ease-in-out_infinite]",
  ],
  variants: {
    variant: {
      circle: [
        "inline-block size-8",
        theme.rounded.full,
      ],
      rectangle: [
        "block w-full h-4",
        theme.rounded.small,
      ],
    },
  },
});

export default skeleton();