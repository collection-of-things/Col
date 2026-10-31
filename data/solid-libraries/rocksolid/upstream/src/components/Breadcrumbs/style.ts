import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const breadcrumbs = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: [
      theme.typography.variants.body2,
      theme.typography.colors.textTertiary,
    ],
    ol: "flex items-center flex-wrap gap-2",
  },
});

export default breadcrumbs();