import {
  type ComponentProps,
  createMemo,
  splitProps,
} from "solid-js";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import cn from "@/components/utils/cn";
import backdropDefaultStyles from "./style";

export type BackdropProps = {
  class?: string;
  onClick?: (event: MouseEvent) => void;
} & Omit<
  ComponentProps<"div">,
  "onClick"
>;

const Backdrop = (
  props: BackdropProps,
) => {

  const [local, rest] = splitProps(props, [
    "children",
    "class",
  ]);

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    if (themeContextValue) {
      return themeContextValue.componentsTV.backdrop();
    }
    return backdropDefaultStyles();
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

export default Backdrop;