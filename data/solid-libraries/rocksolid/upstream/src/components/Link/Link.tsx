import {
  type JSXElement,
  createMemo,
  mergeProps,
  splitProps,
} from "solid-js";
import {
  type VariantProps,
} from "tailwind-variants";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import Typography, {
  type TypographyProps,
} from "@/components/Typography";
import cn from "@/components/utils/cn";
import linkDefaultStyles from "./style";

type LinkVariants = VariantProps<typeof linkDefaultStyles>;

export type LinkProps = {
  children?: JSXElement;
  class?: string;
  color?: TypographyProps["color"];
  href?: string;
  truncate?: boolean;
  underline?: LinkVariants["underline"];
} & Omit<TypographyProps<"a">, "variant">;

const Link = (
  props: LinkProps,
) => {

  const merged = mergeProps({
    color: "default" as const,
    underline: "hover" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "class",
    "underline",
    // Skip props 
    // @ts-ignore
    "variant",
  ]);

  const themeContextValue = useThemeContext();
  
  const classes = createMemo(() => {
    const state = {
      underline: local.underline,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.link(state);
    }
    return linkDefaultStyles(state);
  });

  return (
    <Typography
      {...rest}
      as="a"
      variant="body2"
      class={cn(
        classes(),
        local.class,
      )}
    />
  );
};

export default Link;