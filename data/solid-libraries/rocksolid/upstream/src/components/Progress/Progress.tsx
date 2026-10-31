import {
  type ComponentProps,
  type JSX,
  mergeProps,
  createMemo,
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
import progressDefaultStyles from "./style";

type ProgressVariants = VariantProps<typeof progressDefaultStyles>;

type ProgressSlotProps = Prettify<{
  fill?: Prettify<{
    style?: JSX.CSSProperties;
  } & Omit<ComponentProps<"span">, "style"> & WithExtendedComponentProps>;
}>;

export type ProgressProps = {
  class?: string;
  color?: keyof ThemeColors;
  max?: number;
  min?: number;
  value?: number;
  size?: ProgressVariants["size"];
  slotProps?: ProgressSlotProps;
} & ComponentProps<"div">;

const Progress = (
  props: ProgressProps,
) => {

  const merged = mergeProps({
    color: "default" as const,
    max: 100 as const,
    min: 0 as const,
    value: 0 as const,
    size: "medium" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "color",
    "class",
    "max",
    "min",
    "slotProps",
    "size",
    "value",
    // Skip prop
    "children",
  ]);

  const themeContextValue = useThemeContext();

  const percent = createMemo(() => {
    const min = local.min;
    const max = local.max;
    const val = local.value as number;
    return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
  });
    
  const classes = createMemo(() => {
    const state = {
      color: local.color,
      size: local.size,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.progress(state);
    }
    return progressDefaultStyles(state);
  });

  return (
    <div
      aria-valuemax={local.max}
      aria-valuemin={local.min}
      aria-valuenow={local.value}
      role="progressbar"
      {...rest}
      class={cn(
        classes().base(),
        local.class,
      )}
    >
      <span
        {...local.slotProps?.fill}
        class={cn(
          classes().fill(),
          local.slotProps?.fill?.class,
        )}
        style={{
          ...local.slotProps?.fill?.style,
          width: `${percent()}%`,
        }}
      />
    </div>
  );
};

export default Progress;