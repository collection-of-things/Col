import { tv } from "tailwind-variants";
import asVariants from "@/components/utils/asVariant";
import typedKeys from "@/components/utils/typedKeys";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

const variants = ["filled", "outlined", "ghost"] as const;

export const select = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: [
      "border-0 outline-0",
      theme.rounded.small,
      theme.focus,
    ],
    option: [
      "bg-white dark:bg-neutral-950",
      "text-neutral-900 dark:text-white",
    ],
  },
  variants: {
    color: asVariants(theme.colors, () => ({})),
    disabled: {
      true: {},
      false: {},
    },
    variant: {
      filled: {},
      ghost: {},
      outlined: {
        base: "border border-1"
      },
    },
    size: {
      small: {
        base: "py-1 px-1.5 h-6 text-sm",
      },
      medium: {
        base: "py-1 px-1.5 h-8 text-sm",
      },
      large: {
        base: "py-1.5 px-2 h-10 text-md",
      },
    },
    fullWidth: {
      true: {
        base: "w-full",
      },
      false: {},
    }
  },
  compoundVariants: [
    ...(typedKeys(theme.colors).flatMap(color => (
      variants.flatMap(variant => {
        const themeConfig = theme.colors[color][variant];
        return [
          {
            color,
            variant,
            disabled: false,
            class: {
              base: [
                themeConfig.background,
                themeConfig.border,
                themeConfig.text,
              ],
            },
          },
          {
            color,
            variant,
            disabled: true,
            class: {
              base: [
                variant === "filled" ? theme.disabled.background : "",
                variant === "outlined" ? theme.disabled.border : "",
                theme.disabled.text,
              ],
            },
          },
        ];
      })
    ))),
  ],
});

export default select();