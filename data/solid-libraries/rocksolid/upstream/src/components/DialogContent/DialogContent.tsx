
import {
  type ComponentProps,
  type JSXElement,
  createMemo,
  splitProps,
} from "solid-js";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import cn from "@/components/utils/cn";
import dialogContentStyles from "./style";

export type DialogContentProps = {
  class?: string;
  children?: JSXElement;
} & ComponentProps<"div">;

const DialogContent = (
  props: DialogContentProps,
) => {

  const [local, rest] = splitProps(props, [
    "class",
    "children",
  ]);

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    if (themeContextValue) {
      return themeContextValue.componentsTV.dialogContent();
    }
    return dialogContentStyles();
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

export default DialogContent;