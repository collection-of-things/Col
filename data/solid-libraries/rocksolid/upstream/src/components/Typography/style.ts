import { tv } from "tailwind-variants";
import asVariants from "@/components/utils/asVariant";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const typography = (
  theme: Theme = defaultTheme,
) => tv({
  variants: {
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
      inherit: "[text-align:inherit]",
    },
    color: {
      ...asVariants(theme.colors, config => config.ghost.text),
      ...asVariants(theme.typography.colors, config => config),
      disabled: theme.disabled.text,
      inherit: "text-inherit dark:text-inherit",
    },
    variant: asVariants(theme.typography.variants, value => value),
    truncate: {
      true: "truncate",
      false: "",
    },
  },
});

export default typography();