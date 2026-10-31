import {
  type ComponentProps,
  type JSXElement,
  type ValidComponent,
  createMemo,
  mergeProps,
  splitProps,
  Show,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  type Prettify,
} from "@/components/types/Prettify";
import {
  type WithExtendedComponentProps
} from "@/components/types/ExtendedComponentProps";
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
  useButtonGroupContext,
} from "@/components/ButtonGroup/ButtonGroupContext";
import cn from "@/components/utils/cn";
import buttonDefaultStyles from "./style";

type ButtonVariants = VariantProps<typeof buttonDefaultStyles>;

type ButtonSlotProps = Prettify<{
  startIcon?: Prettify<ComponentProps<"span"> & WithExtendedComponentProps>;
  endIcon?: Prettify<ComponentProps<"span"> & WithExtendedComponentProps>;
}>;

export type ButtonProps<T extends ValidComponent = "button"> = {
  as?: T; // Internal API
  color?: keyof ThemeColors;
  disabled?: ButtonVariants["disabled"];
  endIcon?: JSXElement;
  fullWidth?: boolean;
  size?: ButtonVariants["size"];
  slotProps?: ButtonSlotProps;
  startIcon?: JSXElement;
  variant?: ButtonVariants["variant"];
  children?: JSXElement;
  class?: string;
} & ComponentProps<T>;


const Button = <T extends ValidComponent = "button">(
  props: ButtonProps<T>,
) => {

  const merged = mergeProps({
    as: "button" as const,
    color: "default" as const,
    variant: "solid" as const,
    size: "medium" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "as",
    "children",
    "class",
    "color",
    "disabled",
    "endIcon",
    "fullWidth",
    "size",
    "startIcon",
    "variant",
    "slotProps",
  ]);

  const themeContextValue = useThemeContext();

  const buttonGroupContextValue = useButtonGroupContext();

  const getButtonPropValue = (
    key: "color" | "disabled" | "fullWidth" | "size" | "variant"
  ) => {
    if (typeof props[key] !== "undefined") {
      return props[key];
    }
    if (buttonGroupContextValue) {
      const value = buttonGroupContextValue[key]();
      if (typeof value !== "undefined") {
        return value;
      }
    }
    return local[key];
  };

  const isDisabled = createMemo(() => (
    getButtonPropValue("disabled")
  ));

  const classes = createMemo(() => {
    const state = {
      color: getButtonPropValue("color"),
      disabled: isDisabled(),
      fullWidth: getButtonPropValue("fullWidth"),
      size: getButtonPropValue("size"),
      variant: getButtonPropValue("variant"),
      isChildOfButtonGroup: !!buttonGroupContextValue,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.button(state);
    }
    return buttonDefaultStyles(state);
  });

  return (
    <Dynamic
      component={local.as || "button"}
      {...rest}
      class={cn(
        classes().base(),
        local.class,
      )}
      disabled={isDisabled()}
    >
      <Show when={local.startIcon}>
        <span
          {...local.slotProps?.startIcon}
          class={cn(
            classes().startIcon(),
            local.slotProps?.startIcon?.class,
          )}
        >
          {local.startIcon}
        </span>
      </Show>
      {local.children}
      <Show when={local.endIcon}>
        <span
          {...local.slotProps?.endIcon}
          class={cn(
            classes().endIcon(),
            local.slotProps?.endIcon?.class,
          )}
        >
          {local.endIcon}
        </span>
      </Show>
    </Dynamic>
  );
};

export default Button;