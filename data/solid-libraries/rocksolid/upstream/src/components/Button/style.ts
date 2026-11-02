import { tv } from "tailwind-variants";
import asVariants from "@/components/utils/asVariant";
import typedKeys from "@/components/utils/typedKeys";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

const variants = Object.keys(
  defaultTheme.colors.default
) as Array<keyof typeof defaultTheme.colors.default>;

export const button = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: [
      "inline-flex justify-center items-center gap-2",
      "font-normal align-middle",
      theme.focus,
    ],
    startIcon: "leading-[1] shrink-0",
    endIcon: "leading-[1] shrink-0",
  },
  variants: {
    color: asVariants(theme.colors, () => ({})),
    variant: {
      ...asVariants(theme.colors.default, () => ""),
      outlined: {
        base: "border",
      },
    },
    disabled: {
      true: {
        base: "pointer-events-none",
      },
      false: {
        base: "cursor-pointer",
      },
    },
    size: {
      small: {
        base: "py-[2px] px-2 text-sm min-h-6",
      },
      medium: {
        base: "py-1 px-3 text-sm min-h-8",
      },
      large: {
        base: "py-2 px-5 text-md gap-3 min-h-10",
      },
    },
    fullWidth: {
      true: {
        base: "w-full",
      },
      false: "",
    },
    isChildOfButtonGroup: {
      true: {
        base: [theme.rounded.none],
      },
      false: {
        base: [theme.rounded.small],
      },
    }
  },
  compoundVariants: [
    ...(typedKeys(theme.colors).flatMap(color => (
      variants.map(variant => {
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
                themeConfig.hover,
                themeConfig.active,
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
                theme.disabled.text,
                ["outlined"].includes(variant) ? theme.disabled.border : "", 
                ["solid", "filled"].includes(variant) ? theme.disabled.background : "",
              ],
            },
          },
        ];
      }).flat()
    ))),
  ],
});

export default button();