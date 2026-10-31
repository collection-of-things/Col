import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const dialogContent = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "px-3 py-5",
    theme.typography.variants.body2,
    theme.typography.colors.textSecondary,
  ],
});

export default dialogContent();