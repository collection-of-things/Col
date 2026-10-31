import { tv } from "tailwind-variants";
import asVariants from "@/components/utils/asVariant";
import typedKeys from "@/components/utils/typedKeys";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

const variants = ["solid", "filled", "outlined"] as const;

export const alert = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: [
      "flex items-center gap-2 w-full py-2 px-3 min-w-0 min-h-10",
      theme.rounded.small,
      theme.typography.variants.body2,
    ],
    content: "grow-1 min-w-0",
    icon: "text-lg shrink-0",
    closeButton: [
      "hover:bg-black/15 hover:dark:bg-white/15",
      "active:bg-black/25 active:dark:bg-white/25",
      "text-[inherit] dark:text-[inherit]",
    ],
  },
  variants: {
    color: asVariants(theme.colors, () => ({})),
    variant: {
      solid: {},
      filled: {},
      outlined: {
        base: "border border-1",
      },
    },
  },
  compoundVariants: [
    ...(typedKeys(theme.colors).flatMap((color) => (
      variants.map(variant => {
        const themeConfig = theme.colors[color][variant];
        return {
          color,
          variant,
          class: {
            base: [
              themeConfig.background,
              themeConfig.text,
              themeConfig.border,
            ],
          },
        };
      })
    ))),
  ],
});

export default alert();