import {
  type ComponentProps,
  type JSXElement,
  type ValidComponent,
  createMemo,
  mergeProps,
  splitProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  type VariantProps,
} from "tailwind-variants";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import type {
  ThemeColors
} from "@/components/styles/theme/colors";
import {
  type ButtonProps,
} from "@/components/Button";
import cn from "@/components/utils/cn";
import buttonGroupDefaultStyles from "./style";
import { ButtonGroupContext } from "./ButtonGroupContext";

type ButtonGroupVariants = VariantProps<typeof buttonGroupDefaultStyles>;

export type ButtonGroupProps<T extends ValidComponent = "div"> = {
  as?: T;
  children?: JSXElement;
  class?: string;
  color?: keyof ThemeColors;
  disabled?: ButtonProps["disabled"];
  fullWidth?: ButtonProps["fullWidth"];
  orientation?: ButtonGroupVariants["orientation"];
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
} & ComponentProps<T>;

const ButtonGroup = <T extends ValidComponent = "div">(
  props: ButtonGroupProps<T>,
) => {

  const merged = mergeProps({
    as: "div" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "as",
    "children",
    "class",
    "color",
    "disabled",
    "fullWidth",
    "orientation",
    "size",
    "variant",
  ]);

  const themeContextValue = useThemeContext();
  
  const classes = createMemo(() => {
    const state = {
      color: local.color,
      disabled: local.disabled,
      fullWidth: local.fullWidth,
      orientation: local.orientation,
      variant: local.variant,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.buttonGroup(state);
    }
    return buttonGroupDefaultStyles(state);
  });

  const buttonGroupContextValue = {
    color: () => local.color,
    disabled: () => local.disabled,
    fullWidth: () => local.fullWidth,
    size: () => local.size,
    variant: () => local.variant,
  };

  return (
    <Dynamic
      role="group"
      {...rest}
      component={local.as ?? "div"}
      class={cn(
        local.class,
        classes(),
      )}
    >
      <ButtonGroupContext.Provider
        value={buttonGroupContextValue}
      >
        {local.children}
      </ButtonGroupContext.Provider>
    </Dynamic>
  )
};

export default ButtonGroup;