import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";

export const divider = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: [
      "flex items-center gap-1.5",
      theme.typography.colors.textPrimary,
      theme.typography.variants.body2,
    ],
    divider: [
      theme.divider,
    ],
    beforeDivider: "",
    afterDivider: "",
  },
  variants: {
    align: {
      start: {},
      center: {},
      end: {},
    },
    hasChildren: {
      true: {},
      false: {},
    },
    orientation: {
      horizontal: {
        base: "w-full",
        divider: "border-t",
      },
      vertical: {
        base: "flex-col h-auto self-stretch",
        divider: "border-l",
      },
    },
  },
  compoundVariants: [
    {
      hasChildren: true,
      orientation: "horizontal",
      align: "start",
      class: {
        beforeDivider: "w-[10%]",
        afterDivider: "w-[90%]",
      },
    },
    {
      hasChildren: true,
      orientation: "horizontal",
      align: "center",
      class: {
        beforeDivider: "w-[50%]",
        afterDivider: "w-[50%]",
      },
    },
    {
      hasChildren: true,
      orientation: "horizontal",
      align: "end",
      class: {
        beforeDivider: "w-[90%]",
        afterDivider: "w-[10%]",
      },
    },
    {
      hasChildren: true,
      orientation: "vertical",
      align: "start",
      class: {
        beforeDivider: "h-[10%]",
        afterDivider: "h-[90%]",
      },
    },
    {
      hasChildren: true,
      orientation: "vertical",
      align: "center",
      class: {
        beforeDivider: "h-[50%]",
        afterDivider: "h-[50%]",
      },
    },
    {
      hasChildren: true,
      orientation: "vertical",
      align: "end",
      class: {
        beforeDivider: "h-[90%]",
        afterDivider: "h-[10%]",
      },
    }, 
    {
      hasChildren: false,
      orientation: "horizontal",
      class: {
        beforeDivider: "w-full",
      },
    },
    {
      hasChildren: false,
      orientation: "vertical",
      class: {
        beforeDivider: "h-full",
      },
    },
  ]
});

export default divider();