import {
  type ValidComponent,
  createMemo,
  mergeProps,
  splitProps, 
} from "solid-js";
import Button, {
  type ButtonProps,
} from "@/components/Button";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import cn from "@/components/utils/cn";
import iconButtonDefaultStyles from "./style";

export type IconButtonProps<T extends ValidComponent = "button"> = {
  class?: string;
} & Omit<
  ButtonProps<T>, 
  "fullWidth" | "startIcon" | "endIcon" | "variant" | "slotProps"
>;

const IconButton = <T extends ValidComponent = "button">(
  props: IconButtonProps<T>,
) => {

  const mergedProps = mergeProps({
    size: "medium" as const,
  }, props);

  const [local, rest] = splitProps(mergedProps, [
    "children",
    "class",
    "size",
    /* Skip props */
    // @ts-ignore
    "fullWidth",
    // @ts-ignore
    "startIcon",
    // @ts-ignore
    "endIcon",
    // @ts-ignore
    "variant",
    // @ts-ignore
    "slotProps",
  ]);

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    const state = {
      size: local.size,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.iconButton(state);
    }
    return iconButtonDefaultStyles(state);
  });

  return (
    <Button
      {...rest}
      class={cn(
        classes(),
        local.class
      )}
      fullWidth={false}
      variant="ghost"
    >
      {local.children}
    </Button>
  );
};

export default IconButton;