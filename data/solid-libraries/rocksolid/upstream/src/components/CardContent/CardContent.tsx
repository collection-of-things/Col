import {
  type ComponentProps,
  createMemo,
  splitProps,
} from "solid-js";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import cn from "@/components/utils/cn";
import cardContentDefaultStyles from "./style";

export type CardContentProps = {
  class?: string;
} & ComponentProps<"div">;

const CardContent = (
  props: CardContentProps,
) => {

  const [local, rest] = splitProps(props, [
    "children",
    "class",
  ]);

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    if (themeContextValue) {
      return themeContextValue.componentsTV.cardContent();
    }
    return cardContentDefaultStyles();
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

export default CardContent;