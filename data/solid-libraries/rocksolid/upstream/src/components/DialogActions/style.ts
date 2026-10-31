import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const dialogActions = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "flex items-center justify-end gap-3",
    "border-t py-2.5 px-3",
    theme.divider,
  ],
});

export default dialogActions();