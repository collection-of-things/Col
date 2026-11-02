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
import dialogActionsStyles from "./style";

export type DialogActionsProps = {
  class?: string;
  children?: JSXElement;
} & ComponentProps<"div">;

const DialogActions = (
  props: DialogActionsProps,
) => {

  const [local, rest] = splitProps(props, [
    "class",
    "children",
  ]);

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    if (themeContextValue) {
      return themeContextValue.componentsTV.dialogActions();
    }
    return dialogActionsStyles();
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

export default DialogActions;