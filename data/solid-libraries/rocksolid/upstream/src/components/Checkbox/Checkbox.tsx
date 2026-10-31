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
  type WithExtendedComponentProps
} from "@/components/types/ExtendedComponentProps";
import IconButton, {
  type IconButtonProps,
} from "@/components/IconButton";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import cn from "@/components/utils/cn";
import CheckboxChecked from "@/components/icons/CheckboxChecked";
import CheckboxUnchecked from "@/components/icons/CheckboxUnchecked";
import checkboxDefaultStyles from "./style";

type CheckboxSlotProps = Prettify<{
  base?: Prettify<ComponentProps<"span"> & WithExtendedComponentProps>;
}>;

export type CheckboxProps = {
  checked?: boolean;
  checkedIcon?: JSXElement;
  class?: string;
  color?: IconButtonProps["color"];
  defaultChecked?: boolean;
  disabled?: boolean;
  id?: string; 
  onChange?: (event: Event, checked: boolean) => void;
  size?: IconButtonProps["size"]; 
  slotProps?: CheckboxSlotProps;
  uncheckedIcon?: JSXElement;
} & Omit<ComponentProps<"input">, "onChange">;

const Checkbox = (
  props: CheckboxProps,
) => {

  const mergedProps = mergeProps({
    checkedIcon: <CheckboxChecked />,
    uncheckedIcon: <CheckboxUnchecked />,
  }, props);

  const [local, rest] = splitProps(mergedProps, [
    "checked",
    "checkedIcon",
    "class",
    "color",
    "defaultChecked",
    "disabled",
    "id",
    "onChange",
    "size",
    "slotProps",
    "uncheckedIcon",
    // Skip props
    "children",
  ]);

  const themeContextValue = useThemeContext();

  const isControlled = typeof local.checked === "boolean";
  
  const [localChecked, setLocalChecked] = createSignal(!!local.defaultChecked);

  const isChecked = createMemo(() => (
    isControlled ? local.checked! : localChecked()
  ));

  const handleChange = (event: Event) => {
    const checked = (
      event.currentTarget as HTMLInputElement
    ).checked;
    if (!isControlled) {
      setLocalChecked(checked);
    }
    local.onChange?.(event, checked);  
  };

  const classes = createMemo(() => {
    const state = {
      checked: isChecked(),
      disabled: local.disabled,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.checkbox(state);
    }
    return checkboxDefaultStyles(state);
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
        {...rest}
        id={local.id}
        type="checkbox"
        checked={isChecked()}
        onChange={handleChange}
        disabled={local.disabled}
        class={cn(
          classes().input(),
          local.class,
        )}
      />
    </IconButton>
  );
};

export default Checkbox;