import { tv } from "tailwind-variants";
import asVariants from "@/components/utils/asVariant";
import typedKeys from "@/components/utils/typedKeys";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const label = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "block",
    theme.colors.default.ghost.text,
  ],
  variants: {
    color: asVariants(theme.colors, () => ({})),
    disabled: {
      true: "",
      false: "",
    },
    required: {
      true: [
        "before:content-['*'] before:inline-block before:text-sm",
        "before:pr-1 rtl:before:pl-1",
        "before:text-red-800 dark:before:text-red-400",
      ],
      false: "",
    },
    size: {
      small: "text-sm",
      medium: "text-sm",
      large: "text-md",
    },
    truncate: {
      true: "truncate",
      false: "",
    },
  },
  compoundVariants: [
    ...(typedKeys(theme.colors).flatMap(color => ([
      {
        color,
        disabled: false,
        class: [theme.colors[color].ghost.text],
      },
      {
        color,
        disabled: true,
        class: [theme.disabled.text],
      },
    ]))),
  ],
});

export default label();