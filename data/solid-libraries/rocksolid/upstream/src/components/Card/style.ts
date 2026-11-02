import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const card = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    theme.rounded.small,
  ],
  variants: {
    variant: {
      filled: [
        "bg-neutral-100 dark:bg-neutral-900",
        theme.typography.colors.textSecondary,
        theme.shadow.small,
      ],
      elevated: [
        "bg-white dark:bg-neutral-800",
        "dark:border dark:border-white/10",
        theme.shadow.medium,
      ],
      outlined: [
        "bg-transparent border overflow-hidden",
        theme.divider,
      ],
      ghost: [
        "bg-transparent",
      ],
    }
  },
});

export default card();