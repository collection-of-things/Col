import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const dialogTitle = (
  theme: Theme = defaultTheme,
) => tv({
    base: [
      "p-3 text-md font-semibold",
      "border-b",
      theme.divider,
      theme.typography.colors.textPrimary,
    ],
});

export default dialogTitle();