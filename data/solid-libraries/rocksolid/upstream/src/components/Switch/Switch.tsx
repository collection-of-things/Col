import {
  type ComponentProps,
  createMemo,
  createSignal,
  mergeProps,
  splitProps,
} from "solid-js";
import {
  type VariantProps,
} from "tailwind-variants";
import {
  type Prettify,
} from "@/components/types/Prettify";
import {
  type WithExtendedComponentProps,
} from "@/components/types/ExtendedComponentProps"; 
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import type {
  ThemeColors
} from "@/components/styles/theme/colors";
import cn from "@/components/utils/cn";
import switchDefaultStyles from "./style";

type SwitchVariants = VariantProps<typeof switchDefaultStyles>;

type SwitchSlotProps = Prettify<{
  base?: Prettify<ComponentProps<"span"> & WithExtendedComponentProps>;
  handle?: Prettify<ComponentProps<"span"> & WithExtendedComponentProps>;
}>;

export type SwitchProps = {
  checked?: boolean;
  class?: string;
  color?: keyof ThemeColors;
  defaultChecked?: boolean;
  disabled?: boolean;
  disableTransition?: boolean;
  id?: string; 
  onChange?: (event: Event, checked: boolean) => void;
  size?: SwitchVariants["size"]; 
  slotProps?: SwitchSlotProps;
} & Omit<
  ComponentProps<"input">,
  "type" | "onChange" | "size"
>;

const Switch = (
  props: SwitchProps,
) => {

  const merged = mergeProps({
    color: "default" as const,
    disableTransition: false,
    size: "medium" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "checked",
    "class",
    "color",
    "defaultChecked",
    "disabled",
    "disableTransition",
    "id",
    "onChange",
    "size",
    "slotProps",
    // Skip props
    "children",
    // @ts-ignore
    "type",
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
      color: local.color,
      disabled: local.disabled,
      disableTransition: local.disableTransition,
      size: local.size,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.switch(state);
    }
    return switchDefaultStyles(state);
  });

  return (
    <span
      {...local.slotProps?.base}
      class={cn(
        classes().base(),
        local.slotProps?.base?.class,
      )}
    >
      <span
        {...local.slotProps?.handle}
        class={cn(
          classes().handle(),
          local.slotProps?.handle?.class,
        )}
      />
      <input
        {...rest}
        id={local.id}
        role="switch"
        type="checkbox"
        checked={isChecked()}
        onChange={handleChange}
        disabled={local.disabled}
        class={cn(
          classes().input(),
          local.class,
        )}
      />
    </span>
  );
};

export default Switch;