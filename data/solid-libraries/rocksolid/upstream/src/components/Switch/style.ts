import { tv } from "tailwind-variants";
import asVariants from "@/components/utils/asVariant";
import typedKeys from "@/components/utils/typedKeys";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const switchTv = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: [
      "relative",
      theme.rounded.full,
      theme.focusWithin,
    ],
    handle: [
      "absolute translate-y-[2px]",
      "ltr:translate-x-[2px] rtl:-translate-x-[2px]",
      "bg-white shadow-sm",
      theme.rounded.full,
    ],
    input: "absolute inset-0 w-full h-full opacity-0 outline-none",
  },
  variants: {
    checked: {
      true: {},
      false: {},
    },
    color: asVariants(theme.colors, () => ({})),
    disabled: {
      true: {
        base: [
          "opacity-50",
        ],
      },
      false: {},
    },
    disableTransition: {
      true: {},
      false: {
        base: "transition-[background] duration-300",
        handle: "transition-[translate] duration-300",
      },
    },
    size: {
      small: {
        base: "w-8 h-5",
        handle: "size-4",
      },
      medium: {
        base: "w-10 h-6",
        handle: "size-5",
      },
      large: {
        base: "w-12 h-7",
        handle: "size-6",
      },
    },
  },
  compoundVariants: [
    ...(typedKeys(theme.colors).flatMap(color => ([
      {
        color,
        checked: false,
        class: {
          base: "bg-neutral-300 dark:bg-neutral-700",
        },
      },
      {
        color,
        checked: true,
        class: {
          base: [
            theme.colors[color].solid.background,
          ],
        },
      },
    ]))),
    {
      checked: true,
      size: "small",
      class: {
        handle: "ltr:translate-x-[14px] rtl:-translate-x-[14px]",
      },
    },
    {
      checked: true,
      size: "medium",
      class: {
        handle: "ltr:translate-x-[18px] rtl:-translate-x-[18px]",
      },
    },
    {
      checked: true,
      size: "large",
      class: {
        handle: "ltr:translate-x-[22px] rtl:-translate-x-[22px]",
      },
    },
    {
      color: "default",
      checked: true,
      class: {
        handle: "dark:bg-neutral-900",
      },
    },
  ],
});

export default switchTv();