import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const backdrop = (
  _theme: Theme = defaultTheme,
) => tv({
  base: [
    "fixed inset-0 w-full h-full z-50",
    "flex justify-center items-center",
    "bg-black/50 backdrop-blur-sm",
  ],
});

export default backdrop();