import {
  type ComponentProps,
  createMemo,
  splitProps,
} from "solid-js";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import cn from "@/components/utils/cn";
import cardFooterDefaultStyles from "./style";

export type CardFooterProps = {
  class?: string;
} & ComponentProps<"div">;

const CardFooter = (
  props: CardFooterProps,
) => {

  const [local, rest] = splitProps(props, [
    "children",
    "class",
  ]);

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    if (themeContextValue) {
      return themeContextValue.componentsTV.cardFooter();
    }
    return cardFooterDefaultStyles();
  });

  return (
    <div
      {...rest}
      class={cn(
        classes(),
        local.class,
      )}
    >
      {local.children}
    </div>
  );
};

export default CardFooter;