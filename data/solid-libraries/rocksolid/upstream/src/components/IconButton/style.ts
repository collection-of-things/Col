import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const iconButton = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "px-0 py-0 min-h-[initial]",
    "inline-flex justify-center items-center shrink-0",
    theme.rounded.full,
  ],
  variants: {
    size: {
      small: "size-6 text-lg",
      medium: "size-8 text-2xl", 
      large: "size-10 text-3xl",
    },
  },
});

export default iconButton();