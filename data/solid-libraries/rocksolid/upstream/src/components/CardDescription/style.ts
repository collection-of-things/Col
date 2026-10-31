import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const cardDescription = (
  theme: Theme = defaultTheme,
) => tv({
    base: [
      "pt-1",
      theme.typography.variants.body2,
      theme.typography.colors.textSecondary,
    ],
});

export default cardDescription();