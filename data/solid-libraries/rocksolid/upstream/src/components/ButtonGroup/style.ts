import { tv } from "tailwind-variants";
import asVariants from "@/components/utils/asVariant";
import typedKeys from "@/components/utils/typedKeys";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const buttonGroup = (
  theme: Theme = defaultTheme,
) => tv({
  base: [
    "inline-flex gap-0",
  ],
  variants: {
    disabled: {
      true: "",
      false: "",
    },
    fullWidth: {
      true: "w-full",
      false: "",
    },
    orientation: {
      horizontal: [
        "flex-row",
        "ltr:[&>button:first-child]:rounded-tl-sm",
        "ltr:[&>button:first-child]:rounded-bl-sm",
        "ltr:[&>button:last-child]:rounded-tr-sm",
        "ltr:[&>button:last-child]:rounded-br-sm",
        "rtl:[&>button:first-child]:rounded-tr-sm",
        "rtl:[&>button:first-child]:rounded-br-sm",
        "rtl:[&>button:last-child]:rounded-tl-sm",
        "rtl:[&>button:last-child]:rounded-bl-sm",
      ],
      vertical: [
        "flex-col",
        "[&>button:first-child]:rounded-tl-sm",
        "[&>button:first-child]:rounded-tr-sm",
        "[&>button:last-child]:rounded-bl-sm",
        "[&>button:last-child]:rounded-br-sm",
      ],
    },
    variant: asVariants(theme.colors.default, () => ""),
  },
  compoundVariants: [
    ...typedKeys(theme.colors.default).flatMap((variant) => (
      [true, false].map((disabled) => ({
        orientation: "horizontal" as const,
        variant,
        disabled,
        class: (
          variant !== "outlined" ? ([
            "ltr:[&>button]:border-l-1",
            "rtl:[&>button]:border-r-1", 
            "ltr:[&>button:first-child]:border-l-0",
            "rtl:[&>button:first-child]:border-r-0",
            "ltr:[&>button:last-child]:border-r-0",
            "rtl:[&>button:last-child]:border-l-0",
            ...disabled ? (
              ([
                "ltr:[&>button]:border-l-neutral-300",
                "rtl:[&>button]:border-r-neutral-300",
                "ltr:dark:[&>button]:border-l-neutral-700",
                "rtl:dark:[&>button]:border-r-neutral-700",
              ])
            ) : (
              (["filled", "ghost"].includes(variant) ? ([
                "ltr:[&>button]:border-l-[rgba(127,127,127,0.40)]",
                "rtl:[&>button]:border-r-[rgba(127,127,127,0.40)]",
              ]) : ([
                "ltr:[&>button]:border-l-white/40",
                "rtl:[&>button]:border-r-white/40",
                "ltr:dark:[&>button]:border-l-black/40",
                "rtl:dark:[&>button]:border-r-black/40",
              ]))
            )
          ]) : ([
            "ltr:[&>button:not(:last-child)]:border-r-0",
            "rtl:[&>button:not(:last-child)]:border-l-0",
          ])
        )
      }))
    )),
    ...typedKeys(theme.colors.default).flatMap((variant) => (
      [true, false].map((disabled) => ({
        orientation: "vertical" as const,
        variant,
        disabled,
        class: (
          variant !== "outlined" ? ([
            "[&>button]:border-b-1",
            "[&>button:last-child]:border-b-0",
            ...disabled ? (
              ([
                "[&>button]:border-b-neutral-300",
                "dark:[&>button]:border-b-neutral-700",
              ])
            ) : (
              (["filled", "ghost"].includes(variant) ? ([
                "[&>button]:border-b-[rgba(127,127,127,0.40)]",
              ]) : ([
                "[&>button]:border-b-white/40",            
                "dark:[&>button]:border-b-black/40",
              ]))
            )
          ]) : ([
            "[&>button:not(:last-child)]:border-b-0",
          ])
        )
      }))
    )),
  ],
  defaultVariants: {
    fullWidth: false,
    orientation: "horizontal",
    variant: "solid",
  },
});

export default buttonGroup();