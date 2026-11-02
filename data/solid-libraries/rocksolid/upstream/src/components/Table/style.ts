import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const table = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "w-full border-collapse border-spacing-0 text-sm",
    theme.typography.colors.textPrimary,
  ],
});

export default table();