import { tv } from "tailwind-variants";
import defaultTheme, {
  type Theme,
} from "@/components/styles/theme/";
import asVariants from "@/components/utils/asVariant";

export const avatar = (
  theme: Theme = defaultTheme,
) => tv({
  slots: {
    base: [
      "size-8 grid place-items-center shrink-0 select-none",
      theme.typography.variants.body2,
    ],
    img: "w-full h-full rounded-[inherit]",
  },
  variants: {
    color: asVariants(theme.colors, config => ({
      base: [
        config.solid.background,
        config.solid.text,
      ],
    })),
    rounded: asVariants(theme.rounded, value => ({ 
      base: value,
    })),
    size: {
      small: {
        base: "size-6 text-sm",
      },
      medium: {
        base: "size-8 text-sm",
      },
      large: {
        base: "size-10 text-md",
      },
    },
  },
});

export default avatar();