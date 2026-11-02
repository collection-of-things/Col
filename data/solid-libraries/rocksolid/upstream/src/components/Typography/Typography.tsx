import {
  type ComponentProps,
  type ValidComponent,
  createMemo,
  splitProps,
  mergeProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  type VariantProps,
} from "tailwind-variants";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import {
  type ThemeTypographyColors,
  type ThemeTypographyVariants,
} from "@/components/styles/theme/typography";
import cn from "@/components/utils/cn";
import typographyDefaultStyles from "./style";

type TypographyVariants = VariantProps<typeof typographyDefaultStyles>;

export type TypographyProps<T extends ValidComponent = "p"> = {
  align?: TypographyVariants["align"];
  as?: T;
  class?: string;
  color?: (TypographyVariants["color"] | keyof ThemeTypographyColors);
  variant?: keyof ThemeTypographyVariants;
  truncate?: boolean;
} & ComponentProps<T>;

const variantToTagMap = {
  "h1": "h1",
  "h2": "h2",
  "h3": "h3",
  "h4": "h4",
  "h5": "h5",
  "h6": "h6",
  "body1": "p",
  "body2": "p",
  "code": "code",
  "inherit": "p",
} as const;

const Typography = <T extends ValidComponent = "p">(
  props: TypographyProps<T>,
) => {

  const merged = mergeProps({
    align: "inherit" as const,
    color: "inherit" as const,
    variant: "body2" as const,
    truncate: false,
  }, props);

  const [local, rest] = splitProps(merged, [
    "align",
    "as",
    "class",
    "color", 
    "variant",
    "truncate",
  ]);

  const themeContextValue = useThemeContext();

  const component = createMemo(() => {
    if (local.as) {
      return local.as;
    };
    if (variantToTagMap.hasOwnProperty(local.variant)) {
      return variantToTagMap[local.variant];
    }
    return variantToTagMap["body1"];
  });
    
  const classes = createMemo(() => {
    const state = {
      align: local.align,
      color: local.color,
      variant: local.variant,
      truncate: local.truncate,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.typography(state);
    }
    return typographyDefaultStyles(state);
  });

  return (
    <Dynamic
      {...rest}
      component={component()}
      class={cn(
        classes(),
        local.class,
      )}
    />
  );
};

export default Typography;