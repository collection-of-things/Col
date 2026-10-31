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
import textareaDefaultStyles from "./style";

type TextareaVariants = VariantProps<typeof textareaDefaultStyles>;

export type TextareaProps = {
  class?: string;
  color?: keyof ThemeColors;
  disabled?: boolean;
  fullWidth?: boolean;
  resize?: "x" | "y" | "both" | "none";
  size?: TextareaVariants["size"];
  variant?: TextareaVariants["variant"];
} & Omit<
  ComponentProps<"textarea">,
  "size"
>;

const Textarea = (
  props: TextareaProps,
) => {

  const merged = mergeProps({
    color: "default" as const,
    disabled: false,
    resize: "y" as const,
    size: "medium" as const,
    variant: "outlined" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "class",
    "color",
    "disabled",
    "fullWidth",
    "resize",
    "size",
    "variant",
  ]);

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    const state = {
      color: local.color,
      disabled: local.disabled,
      fullWidth: local.fullWidth,
      resize: local.resize,
      size: local.size,
      variant: local.variant,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.textarea(state);
    }
    return textareaDefaultStyles(state);
  });

  return (
    <textarea
      {...rest}
      disabled={local.disabled}
      class={cn(
        classes(),
        local.class,
      )}
    />
  );
};

export default Textarea;