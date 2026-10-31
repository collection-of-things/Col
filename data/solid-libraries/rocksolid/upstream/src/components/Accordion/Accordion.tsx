import {
  type ComponentProps,
  createMemo,
  createSignal,
  mergeProps,
  splitProps,
} from "solid-js";
import cn from "@/components/utils/cn";
import {
  useThemeContext,
} from "@/components/ThemeProvider";
import {
  type AccordionContextValue,
  AccordionContext,
} from "@/components/AccordionContext";
import accordionDefaultStyles from "./style";

export type AccordionProps = {
  accordionId?: string;
  class?: string;
  defaultExpanded?: boolean;
  disabled?: boolean;
  disableTransition?: boolean;
  expanded?: boolean;
  onChange?: (event: Event, expanded: boolean) => void;
} & Omit<ComponentProps<"div">, "onChange">;

const Accordion = (
  props: AccordionProps,
) => {

  const mergedProps = mergeProps({
    defaultExpanded: false,
    disabled: false,
    disableTransition: false,
  }, props);

  const [local, rest] = splitProps(mergedProps, [
    "accordionId",
    "children",
    "class",
    "defaultExpanded",
    "disabled",
    "disableTransition",
    "expanded",
    "onChange",
  ]);

  const themeContextValue = useThemeContext();

  const isControlled = typeof local.expanded === "boolean";

  const [localExpanded, setLocalExpanded] = createSignal(!!local.defaultExpanded);

  const isExpanded = createMemo(() => (
    isControlled ? local.expanded! : localExpanded()
  ));

  const handleToggleExpand = (event: Event) => {
    const next = !isExpanded();
    if (!isControlled) {
      setLocalExpanded(next);
    }
    local.onChange?.(event, next);
  };

  const classes = createMemo(() => {
    if (themeContextValue) {
      return themeContextValue.componentsTV.accordion();
    }
    return accordionDefaultStyles();
  });

  const conextValue: AccordionContextValue = {
    accordionId: () => local.accordionId,
    isExpanded,
    isDisabled: () => local.disabled,
    disableTransition: () => local.disableTransition,
    onToggleExpand: handleToggleExpand,
  };

  return (
    <div
      {...rest}
      class={cn(
        classes(),
        local.class,
      )}
    >
      <AccordionContext.Provider
        value={conextValue}
      >
        {local.children}
      </AccordionContext.Provider>
    </div>
  );
};

export default Accordion;