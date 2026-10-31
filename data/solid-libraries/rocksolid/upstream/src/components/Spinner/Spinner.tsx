import {
  type ComponentProps,
  createMemo,
  createUniqueId,
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
import spinnerDefaultStyles from "./style";

type SpinnerVariants = VariantProps<typeof spinnerDefaultStyles>;

export type SpinnerProps = {
  class?: string;
  color?: keyof ThemeColors;
  label?: string;
  size?: SpinnerVariants["size"];
} & ComponentProps<"span">;

export const Spinner = (
  props: SpinnerProps,
) => {

  const merged = mergeProps({
    color: "default" as const,
    size: "medium" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "class",
    "color",
    "label",
    "size",
    // Skip props
    "children",
  ]);

  const themeContextValue = useThemeContext();

  const labelId = createUniqueId();
  
  const classes = createMemo(() => {
    const state = {
      color: local.color,
      size: local.size,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.spinner(state);
    }
    return spinnerDefaultStyles(state);
  });

  return (
    <span
      role="status"
      {...rest}
      aria-labelledby={labelId}
      class={cn(
        classes().base(),
        local.class,
      )}
    >
      <svg
        aria-hidden={true}
        class={cn(
          classes().svg(),
        )}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          stroke-width="3"
          opacity="0.45"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
      <span
        class={cn("sr-only")}
        id={labelId}
      >
        {local.label ?? "Loading"}
      </span>
    </span>
  );
}

export default Spinner;