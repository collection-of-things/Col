import { tv } from "tailwind-variants";
import asVariants from "@/components/utils/asVariant";
import typedKeys from "@/components/utils/typedKeys";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

const variants = ["filled", "outlined", "ghost"] as const;

export const input = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: [
      "inline-flex items-center overflow-hidden",
      theme.rounded.small,
      theme.focusWithin,
    ],
    input: [
      "w-full h-full border-0 outline-0",
    ],
    prefix: "leading-[1] shrink-0 ps-1.5 pe-1",
    suffix: "leading-[1] shrink-0 ps-1 pe-1.5",
  },
  variants: {
    color: asVariants(theme.colors, () => ""),
    disabled: {
      true: {},
      false: {},
    },
    fullWidth: {
      true: {
        base: "w-full",
      },
      false: {},
    },
    size: {
      small: {
        base: "h-6 text-sm",
        input: "py-1 px-1.5",
      },
      medium: {
        base: "h-8 text-sm",
        input: "py-1 px-1.5",
      },
      large: {
        base: "h-10 text-md",
        input: "py-1.5 px-2",
      }
    },
    variant: {
      filled: {},
      ghost: {},
      outlined: {
        base: "border border-1",
      },
    },
  },
  compoundVariants: [
    ...(typedKeys(theme.colors).flatMap(color => (
      variants.flatMap(variant => {
        const themeConfig = theme.colors[color][variant];
        return [
          {
            color,
            disabled: false,
            variant,
            class: {
              base: [
                themeConfig.background,
                themeConfig.border,
                themeConfig.text,
              ],
              prefix: [
                themeConfig.text,
              ],
              suffix: [
                themeConfig.text,
              ],
            },
          },
          {
            color,
            disabled: true,
            variant,
            class: {
              base: [
                variant === "filled" ? theme.disabled.background : "",
                variant === "outlined" ? theme.disabled.border : "",
                theme.disabled.text,
              ],
              prefix: [
                theme.disabled.text,
              ],
              suffix: [
                theme.disabled.text,
              ],
            },
          },
        ];
      })
    ))),
  ],
});

export default input();