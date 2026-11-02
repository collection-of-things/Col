import { tv } from "tailwind-variants";
import asVariants from "@/components/utils/asVariant";
import typedKeys from "@/components/utils/typedKeys";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

const variants = ["solid", "filled", "outlined"] as const;

export const chip = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: [
      "inline-flex items-center gap-1 max-w-full",
      "font-normal align-middle",
      theme.typography.colors.textPrimary,
      theme.rounded.full,
    ],
    label: "",
    deleteIcon: "shrink-0",
  },
  variants: {
    color: asVariants(theme.colors, () => ({})),
    variant: {
      solid: {},
      filled: {},
      outlined: {
        base: "border",
      },
    },
    disabled: {
      true: {
        base: "pointer-events-none",
      },
      false: {
        deleteIcon: "cursor-pointer",
      },
    },
    size: {
      small: {
        base: "h-6 px-1.5 py-[2px] gap-[2px] text-xs",
        deleteIcon: "text-md",
      },
      medium: {
        base: "h-7 px-2.5 py-1 gap-[3px] text-sm",
        deleteIcon: "text-lg",
      },
      large: {
        base: "h-8 px-3 py-1.5 gap-1 text-md",
        deleteIcon: "text-xl",
      },
    },
    clickable: {
      true: {},
      false: {},
    },
    hasDeleteIcon: {
      true: {},
      false: {}
    },
    hasAvatarElement: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    ...(typedKeys(theme.colors).flatMap(color => (
      variants.map(variant => {
        const themeConfig = theme.colors[color][variant];
        return [
          {
            color,
            variant,
            clickable: false,
            disabled: false,
            class: {
              base: [
                themeConfig.background,
                themeConfig.border,
                themeConfig.text,
              ],
            }
          },
          {
            color,
            variant,
            clickable: true,
            disabled: false,
            class: {
              base: [
                "cursor-pointer",
                themeConfig.background,
                themeConfig.border,
                themeConfig.text,
                themeConfig.hover,
                themeConfig.active,
              ],
            }
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
            }
          }
        ];
      }).flat()
    ))),
    {
      hasDeleteIcon: true,
      size: "small",
      class: {
        base: "ps-1.5 pe-1",
      },
    },
    {
      hasDeleteIcon: true,
      size: "medium",
      class: {
        base: "ps-2.5 pe-1.5",
      },
    },
    {
      hasDeleteIcon: true,
      size: "large",
      class: {
        base: "ps-3 pe-2",
      },
    },
    {
      hasAvatarElement: true,
      size: "small",
      class: {
        base: "ps-[2px]",
        label: "ps-[1px]",
      },
    },
    {
      hasAvatarElement: true,
      size: "medium",
      class: {
        base: "ps-[3px]",
        label: "ps-[2px]",
      },
    },
    {
      hasAvatarElement: true,
      size: "large",
      class: {
        base: "ps-1",
        label: "ps-[3px]",
      },
    },
    {
      clickable: true,
      disabled: false,
      class: {
        base: [theme.focus],
      },
    },
  ],
});

export default chip();