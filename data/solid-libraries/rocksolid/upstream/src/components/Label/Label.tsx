import {
  type ComponentProps,
  createMemo,
  mergeProps,
  splitProps,
} from "solid-js";
import {
  type VariantProps,
} from "tailwind-variants";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import type {
  ThemeColors
} from "@/components/styles/theme/colors";
import cn from "@/components/utils/cn";
import labelDefaultStyles from "./style";

type LabelVariants = VariantProps<typeof labelDefaultStyles>;

export type LabelProps = {
  class?: string;
  color?: keyof ThemeColors;
  disabled?: LabelVariants["disabled"],
  for?: string;
  required?: boolean;
  size?: LabelVariants["size"];
  truncate?: boolean;
} & ComponentProps<"label">;

const Label = (
  props: LabelProps,
) => {

  const merged = mergeProps({
    color: "default" as const,
    disabled: false,
    size: "medium" as const,
    truncate: false,
  }, props);

  const [local, rest] = splitProps(merged, [
    "class",
    "color",
    "disabled",
    "required",
    "size",
    "truncate",
  ]);

  const themeContextValue = useThemeContext();
  
  const classes = createMemo(() => {
    const state = {
      color: local.color,
      disabled: local.disabled,
      required: local.required,
      size: local.size,
      truncate: local.truncate,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.label(state);
    }
    return labelDefaultStyles(state);
  });

  return (
    <label
      {...rest}
      class={cn(
        classes(),
        local.class,
      )}
    />
  );
};

export default Label;