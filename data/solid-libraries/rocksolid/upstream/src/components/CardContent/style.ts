import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const cardContent = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "px-4 py-2",
    theme.typography.variants.body2,
    theme.typography.colors.textSecondary,
  ],
});

export default cardContent();