import {
  type ComponentProps,
  type JSXElement,
  type ValidComponent,
  children,
  createMemo,
  For,
  mergeProps,
  splitProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  type Prettify,
} from "@/components/types/Prettify";
import  {
  type WithExtendedComponentProps
} from "@/components/types/ExtendedComponentProps";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import cn from "@/components/utils/cn";
import breadcrumbsDefaultStyle from "./style";

type BreadcrumbsSlotProps = Prettify<{
  ol?: Prettify<ComponentProps<"ol"> & WithExtendedComponentProps>,
  li?: Prettify<ComponentProps<"li"> & WithExtendedComponentProps>,
  seperator?: Prettify<ComponentProps<"li"> & WithExtendedComponentProps>;
}>;

export type BreadcrumbsProps<T extends ValidComponent = "nav"> = {
  as?: T;
  class?: string;
  seperator?: JSXElement;
  slotProps?: BreadcrumbsSlotProps;
} & ComponentProps<T>;

const Breadcrumbs = <T extends ValidComponent = "nav">(
  props: BreadcrumbsProps<T>,
) => {

  const merged = mergeProps({
    seperator: "/" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "as",
    "children",
    "class",
    "seperator",
    "slotProps",
  ]);

  const themeContextValue = useThemeContext();

  const resolved = children(() => local.children);

  const items = resolved.toArray();

  const classes = createMemo(() => {
    if (themeContextValue) {
      return themeContextValue.componentsTV.breadcrumbs();
    }
    return breadcrumbsDefaultStyle();
  });

  return (
    <Dynamic
      {...rest}
      component={local.as ?? "nav"}
      class={cn(
        classes().base(),
        local.class,
      )}
    >
      <ol
        {...local.slotProps?.ol}
        class={cn(
          classes().ol(),
          local.slotProps?.ol?.class,
        )}
      >
        <For each={items}>
          {(child, index) => (
            <>
              <li
                {...local.slotProps?.li}
              >
                {child}
              </li>
              {(index() !== (items.length - 1)) ? (
                <li
                  aria-hidden={true}
                  {...local.slotProps?.seperator}
                >
                  {local.seperator}
                </li>
              ) : null}
            </>
          )}
        </For>
      </ol>
    </Dynamic>
  );
};

export default Breadcrumbs;