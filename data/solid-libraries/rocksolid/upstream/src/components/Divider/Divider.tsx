import {
  type ComponentProps,
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
import cn from "@/components/utils/cn";
import dividerDefaultStyles from "./style";

type DividerVariants = VariantProps<typeof dividerDefaultStyles>;

type DividerSlotProps = Prettify<{
  divider?: Prettify<ComponentProps<"span"> & WithExtendedComponentProps>; 
}>;

export type DividerProps<T extends ValidComponent = "div"> = {
  align?: DividerVariants["align"];
  as?: T;
  class?: string;
  orientation?: DividerVariants["orientation"];
  slotProps?: DividerSlotProps;
} & ComponentProps<T>;

const Divider = <T extends ValidComponent = "div">(
  props: DividerProps<T>,
) => {

  const merged = mergeProps({
    align: "center" as const,
    orientation: "horizontal" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "align",
    "as",
    "class",
    "children",
    "orientation",
    "slotProps",
  ]);

  const themeContextValue = useThemeContext();

  const hasChildren = createMemo(() => !!local.children);
  
  const classes = createMemo(() => {
    const state = {
      align: local.align,
      hasChildren: hasChildren(),
      orientation: local.orientation,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.divider(state);
    }
    return dividerDefaultStyles(state);
  });

  return (
    <Dynamic
      role="separator"
      aria-orientation={(
        local.orientation === "horizontal" ? (
          "horizontal" 
        ) : (
          "vertical"
        )
      )}
      {...rest}
      component={local.as || "div"}
      class={cn(
        classes().base(),
        local.class,
      )}
    >
      <span
        {...local.slotProps?.divider}
        class={cn(
          classes().divider(),
          classes().beforeDivider(),
          local.slotProps?.divider?.class,
        )}
      />
      <Show when={hasChildren()}>
        {local.children}
        <span
          {...local.slotProps?.divider}
          class={cn(
            classes().divider(),
            classes().afterDivider(),
            local.slotProps?.divider?.class,
          )}
        />
      </Show>
    </Dynamic>
  );
};

export default Divider;