import {
  type ComponentProps,
  type JSXElement,
  createMemo,
  createRenderEffect,
  onMount,
  splitProps,
} from "solid-js";
import cn from "@/components/utils/cn";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import {
  useAccordionContext,
} from "@/components/AccordionContext";
import accordionDetailsDefaultStyles from "./style";

export type AccordionDetailsProps = {
  children?: JSXElement;
  class?: string;
  onTransitionEnd?: (event: TransitionEvent) => void;
  ref?: (element: HTMLDivElement) => void;
} & Omit<
  ComponentProps<"div">, "ref"
>;

const AccordionDetails = (
  props: AccordionDetailsProps,
) => {

  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "onTransitionEnd",
    "ref",
  ]);

  let firstCycle = true;

  const themeContextValue = useThemeContext();

  const accordionContextValue = useAccordionContext();

  let ref!: HTMLDivElement;

  const isExpanded = () => accordionContextValue.isExpanded();

  const isExpandedOnMount = isExpanded();

  let transitionCompleted: boolean = isExpandedOnMount;

  const applyAccordionDetailsHeight = () => {
    if (accordionContextValue.disableTransition() || firstCycle) {
      const height = isExpanded() ? "auto" : "0px";
      if (ref) {
        ref.style.height = height;
      }
      return;
    }
    const height = isExpanded() ? (ref?.scrollHeight ?? 0) : 0;
    if (ref) {
      if (!isExpanded() && transitionCompleted) {
        ref.style.height = `${ref?.scrollHeight ?? 0}px`;
      }
      /* force sync layout to prevent styles batching */
      void ref.offsetHeight;
      transitionCompleted = false;
      ref.style.height = `${height}px`;
    }
  };

  const classes = createMemo(() => {
    const state = {
      expanded: isExpandedOnMount,
      disableTransition: accordionContextValue.disableTransition(),
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.accordionDetails(state);
    }
    return accordionDetailsDefaultStyles(state);
  });

  onMount(() => {
    applyAccordionDetailsHeight();
    firstCycle = false;
  });

  createRenderEffect(() => {
    applyAccordionDetailsHeight();
  });

  const handleTransitionEnd = (event: TransitionEvent) => {
    if (
      event.target === ref &&
      event.propertyName === "height"
    ) {
      if (isExpanded()) {
        transitionCompleted = true;
        ref.style.height = "auto";
      }
    }
    local.onTransitionEnd?.(event);
  };

  const a11yAttrs = createMemo(() => {
    const accordionId = accordionContextValue.accordionId();
    if (accordionId) {
      return {
        "aria-labelledby": `accordion-${accordionId}-summary`,
        "id": `accordion-${accordionId}-details`,
        "role": "region" as const,
      };
    }
    return undefined;
  });
 
  return (
    <div
      {...a11yAttrs()}
      {...rest}
      class={cn(
        classes().base(),
        local.class,
      )}
      onTransitionEnd={handleTransitionEnd}
      ref={(element) => {
        ref = element;
        local.ref?.(element);
      }}
    >
      <div
        class={classes().content()}
      >
        {local.children}
      </div>
    </div>
  );
};

export default AccordionDetails;