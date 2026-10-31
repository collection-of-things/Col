import {
  type ComponentProps,
  For,
  createEffect,
  createMemo,
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
  type WithExtendedComponentProps
} from "@/components/types/ExtendedComponentProps";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import type {
  ThemeColors
} from "@/components/styles/theme/colors";
import cn from "@/components/utils/cn";
import selectDefaultStyles from "./style";
import theme from "@/components/styles/theme";

type SelectVariants = VariantProps<typeof selectDefaultStyles>;

type SelectSlotProps = Prettify<{
  option?: Prettify<ComponentProps<"option"> & WithExtendedComponentProps>;
}>;

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SelectProps = {
  class?: string;
  color?: keyof ThemeColors;
  disabled?: boolean;
  fullWidth?: boolean;
  onChange?: (event: Event) => void;
  options?: SelectOption[];
  ref?: (elem: HTMLSelectElement) => void;
  size?: SelectVariants["size"];
  slotProps?: SelectSlotProps;
  value?: string;
  variant?: SelectVariants["variant"];
} & Omit<
  ComponentProps<"select">,
  "multiple" | "onChange" | "ref"
>;

const Select = (
  props: SelectProps,
) => {

  const merged = mergeProps({
    color: "default" as const,
    disabled: false,
    variant: "outlined" as const,
    size: "medium" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "class",
    "color",
    "disabled",
    "fullWidth",
    "options",
    "ref",
    "size",
    "slotProps",
    "value",
    "variant",
    // Skip props
    "children",
    // @ts-ignore
    "multiple",
  ]);

  let selectRef!:HTMLSelectElement;

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    const state = {
      color: local.color,
      disabled: local.disabled,
      fullWidth: local.fullWidth,
      size: local.size,
      variant: local.variant,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.select(state);
    }
    return selectDefaultStyles(state);
  });

  const selectOptions = createMemo(() => (
    local.options ?? []
  ));

  createEffect(() => {
    selectRef.value =  local.value ?? "";
  });

  return (
    <select
      {...rest}
      ref={(element) => {
        selectRef = element;
        local.ref?.(element);
      }}
      multiple={false}
      disabled={local.disabled}
      class={cn(
        classes().base(),
        local.class,
      )}
    >
      <For each={selectOptions()}>
        {(option) => (
          <option
            {...local.slotProps?.option}
            value={option.value}
            disabled={option.disabled}
            class={cn(
              classes().option(),
              option.disabled ? theme.disabled.text : "",
              local.slotProps?.option?.class,
            )}
          >
            {option.label}
          </option>
        )}
      </For>
    </select>
  );
};

export default Select;