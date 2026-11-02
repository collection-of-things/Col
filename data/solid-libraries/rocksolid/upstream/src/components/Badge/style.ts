import { tv } from "tailwind-variants";
import asVariants from "@/components/utils/asVariant";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const badge = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: "relative",
    badge: [
      "absolute grid place-items-center leading-0 select-none",
      "text-xs font-semibold",
      theme.rounded.full,
    ],
  },
  variants: {
    color: asVariants(theme.colors, (config) => ({
      badge: [
        config.solid.background,
        config.solid.text,
      ],
    })),
    yPos: {
      top: {
        badge: "top-0 -translate-y-1/2",
      },
      bottom: {
        badge: "bottom-0 translate-y-1/2",
      },
    },
    xPos: {
      left: {
        badge: "left-0 -translate-x-1/2",
      },
      right: {
        badge: "right-0 translate-x-1/2",
      },
    },
    overlap: {
      circle: {},
      rect: {},
    },
    empty: {
      true: {
        badge: "min-w-2 min-h-2 w-2 h-2",
      },
      false: {
        badge: [
          "p-1 min-w-4 min-h-4 w-fit-content h-4",
          "leading-0 grid place-items-center",
        ],
      },
    },
  },
  compoundVariants: [
    {
      overlap: "circle",
      xPos: "left",
      class: {
        badge: "left-[15%]",
      },
    },
    {
      overlap: "circle",
      xPos: "right",
      class: {
        badge: "right-[15%]",
      },
    },
    {
      overlap: "circle",
      yPos: "top",
      class: {
        badge: "top-[15%]",
      },
    },
    {
      overlap: "circle",
      yPos: "bottom",
      class: {
        badge: "bottom-[15%]",
      },
    },
  ],
});

export default badge();