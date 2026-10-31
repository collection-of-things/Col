import {
  type JSXElement,
  type ValidComponent,
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
import cardTitleStyles from "./style";

export type CardTitleProps<T extends ValidComponent = "h2"> = {
  class?: string;
  children?: JSXElement;
} & TypographyProps<T>;

const CardTitle = <T extends ValidComponent = "h2">(
  props: CardTitleProps<T>,
) => {

  const [local, rest] = splitProps(props, [
    "class",
    "children",
  ]);

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    if (themeContextValue) {
      return themeContextValue.componentsTV.cardTitle();
    }
    return cardTitleStyles();
  });

  return (
    <Typography
      as="h2"
      color="textPrimary"
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

export default CardTitle;