import {
  type ComponentProps,
  createMemo,
  splitProps,
} from "solid-js";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import cn from "@/components/utils/cn";
import cardHeaderDefaultStyles from "./style";

export type CardHeaderProps = {
  class?: string;
} & ComponentProps<"div">;

const CardHeader = (
  props: CardHeaderProps,
) => {

  const [local, rest] = splitProps(props, [
    "children",
    "class",
  ]);

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    if (themeContextValue) {
      return themeContextValue.componentsTV.cardHeader();
    }
    return cardHeaderDefaultStyles();
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

export default CardHeader;