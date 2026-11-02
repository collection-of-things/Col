import {
  type ComponentProps,
  type JSXElement,
  createMemo,
  createSignal,
  mergeProps,
  splitProps,
} from "solid-js";
import {
  type Prettify,
} from "@/components/types/Prettify";
import {
  type WithExtendedComponentProps,
} from "@/components/types/ExtendedComponentProps";
import IconButton, {
  type IconButtonProps
} from "@/components/IconButton";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import {
  useRadioGroupContext,
} from "@/components/RadioGroupContext";
import RadioChecked from "@/components/icons/RadioChecked";
import RadioUnchecked from "@/components/icons/RadioUnchecked";
import cn from "@/components/utils/cn";
import radioDefaultStyles from "./style";

type RadioSlotProps = Prettify<{
  base?: Prettify<ComponentProps<"span"> & WithExtendedComponentProps>;
}>;

export type RadioProps = {
  class?: string;
  checked?: boolean;
  checkedIcon?: JSXElement;
  color?: IconButtonProps["color"],
  defaultChecked?: boolean;
  disabled?: boolean;
  id?: string;
  onChange?: (event: Event) => void;
  size?: IconButtonProps["size"];
  slotProps?: RadioSlotProps;
  uncheckedIcon?: JSXElement;
  value?: string;
} & Omit<ComponentProps<"input">, "type">;

const Radio = (
  props: RadioProps,
) => {

  const mergedProps = mergeProps({
    checkedIcon: <RadioChecked />,
    uncheckedIcon: <RadioUnchecked />,
  }, props);

  const [local, rest] = splitProps(mergedProps, [
    "checked",
    "checkedIcon",
    "class",
    "color",
    "defaultChecked",
    "disabled",
    "name",
    "onChange",
    "size",
    "slotProps",
    "uncheckedIcon",
    "value",
    // Skip props
    "children",
  ]);

  const themeContextValue = useThemeContext();

  const radioGroupContextValue = useRadioGroupContext();

  const isControlled = typeof local.checked === "boolean";

  const [localChecked, setLocalChecked] = createSignal(!!local.defaultChecked);

  const isChecked = createMemo(() => {
    if (radioGroupContextValue) {
      return radioGroupContextValue.value() === local.value;
    }
    if (isControlled) {
      return local.checked;
    }
    return localChecked();
  });

  const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    const value = target.value;
    if (!radioGroupContextValue && !isControlled) {
      setLocalChecked(checked);
    }
    local.onChange?.(event);
    radioGroupContextValue?.onChange(event, value);
  };

  const classes = createMemo(() => {
    const state = {
      checked: isChecked(),
      disabled: local.disabled,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.radio(state);
    }
    return radioDefaultStyles(state);
  });

  return (
    <IconButton
      {...local.slotProps?.base}
      as="span"
      class={cn(
        classes().base(),
        local.slotProps?.base?.class,
      )}
      color={local.color}
      size={local.size}
      disabled={local.disabled}
    >
      {isChecked() ? (
        local.checkedIcon
      ) : (
        local.uncheckedIcon
      )}
      <input
        name={(
          radioGroupContextValue?.name?.() ?? local.name
        )}
        {...rest}
        type="radio"
        checked={isChecked()}
        onChange={handleChange}
        disabled={local.disabled}
        value={local.value}
        class={cn(
          classes().input(),
          local.class,
        )}
      />
    </IconButton>
  );
};

export default Radio;