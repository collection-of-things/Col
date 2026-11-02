import { tv } from "tailwind-variants";
import asVariants from "@/components/utils/asVariant";
import typedKeys from "@/components/utils/typedKeys";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

const variants = ["filled", "outlined", "ghost"] as const;

export const textarea = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "border-0 outline-0",
    theme.rounded.small,
    theme.focus,
  ],
  variants: {
    color: asVariants(theme.colors, () => ""),
    disabled: {
      true: "",
      false: "",
    },
    variant: {
      filled: "",
      ghost: "",
      outlined: "border border-1",
    },
    resize: {
      x: "resize-x",
      y: "resize-y",
      both: "resize",
      none: "resize-none",
    },
    size: {
      small: "py-1 px-1.5 h-10 text-sm",
      medium: "py-1 px-1.5 h-15 text-sm",
      large: "py-1.5 px-2 h-20 text-md",
    },
    fullWidth: {
      true: "w-full",
      false: "",
    },
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
            class: [
              themeConfig.background,
              themeConfig.border,
              themeConfig.text,
            ],
          },
          {
            color,
            variant,
            disabled: true,
            class: [
              variant === "filled" ? theme.disabled.background : "",
              variant === "outlined" ? theme.disabled.border : "",
              theme.disabled.text,
            ],
          },
        ];
      })
    ))),
  ],
});

export default textarea();