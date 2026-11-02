import {
  type JSXElement,
  createMemo,
  splitProps,
} from "solid-js";
import Typography, {
  type TypographyProps,
} from "@/components/Typography/Typography";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import cn from "@/components/utils/cn";
import cardDescriptionStyles from "./style";

export type CardDescriptionProps = {
  class?: string;
  children?: JSXElement;
} & TypographyProps;

const CardDescription = (
  props: CardDescriptionProps,
) => {

  const [local, rest] = splitProps(props, [
    "class",
    "children",
  ]);

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    if (themeContextValue) {
      return themeContextValue.componentsTV.cardDescription();
    }
    return cardDescriptionStyles();
  });

  return (
    <Typography
      as="p"
      color="textSecondary"
      {...rest}
      class={cn(
        classes(),
        local.class,
      )}
    >
      {local.children}
    </Typography>
  );
};

export default CardDescription;