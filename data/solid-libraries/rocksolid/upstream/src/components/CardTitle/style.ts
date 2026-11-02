import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const cardTitle = (
  theme: Theme = defaultTheme,
) => tv({
    base: [
      theme.typography.variants.h5,
      theme.typography.colors.textPrimary,
    ],
});

export default cardTitle();