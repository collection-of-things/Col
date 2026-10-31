import {
  type ComponentProps,
  type JSXElement,
  createMemo,
  mergeProps,
  splitProps,
} from "solid-js";
import {
  type Prettify,
} from "@/components/types/Prettify";
import  {
  type WithExtendedComponentProps,
} from "@/components/types/ExtendedComponentProps";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import Button, {
  type ButtonProps,
} from "@/components/Button";
import {
  useAccordionContext,
} from "@/components/AccordionContext";
import AngleUp from "@/components/icons/AngleUp";
import AngleDown from "@/components/icons/AngleDown";
import cn from "@/components/utils/cn";
import accordionSummaryDefaultStyles from "./style";

type AccordionSummarySlotProps = Prettify<{
  button?: Prettify<ButtonProps<"button"> & WithExtendedComponentProps>;
  icon?: NonNullable<ButtonProps<"button">["slotProps"]>["endIcon"];
}>;

export type AccordionSummaryProps = {
  children?: JSXElement; 
  class?: string;
  collapsedIcon?: JSXElement;
  expandedIcon?: JSXElement;
  slotProps?: AccordionSummarySlotProps;
} & ComponentProps<"div">;

const AccordionSummary = (
  props: AccordionSummaryProps,
) => {

  const mergedProps = mergeProps({
    collapsedIcon: <AngleUp class={cn("text-lg")} />,
    expandedIcon: <AngleDown class={cn("text-lg")} />,
  }, props);

  const [local, rest] = splitProps(mergedProps, [
    "children",
    "collapsedIcon",
    "expandedIcon",
    "slotProps",
  ]);

  const themeContextValue = useThemeContext();

  const accordionContextValue = useAccordionContext();

  const endIcon = createMemo(() => (
    accordionContextValue.isExpanded() ? (
      local.expandedIcon
    ) : (
      local.collapsedIcon
    )
  ));

  const classes = createMemo(() => {
    if (themeContextValue) {
      return themeContextValue.componentsTV.accordionSummary();
    }
    return accordionSummaryDefaultStyles();
  });

  const a11yAttrs = createMemo(() => {
    const accordionId = accordionContextValue.accordionId();
    const attrs = {
      "aria-expanded": accordionContextValue.isExpanded(),
    };
    if (accordionId) {
      return {
        ...attrs,
        "aria-controls": `accordion-${accordionId}-details`,
        "id": `accordion-${accordionId}-summary`,
      };
    }
    return attrs;
  });
 
  return (
    <div
      {...rest}
    >
      <Button
        {...a11yAttrs()}
        {...local.slotProps?.button}
        onClick={accordionContextValue.onToggleExpand}
        endIcon={endIcon()}
        disabled={accordionContextValue.isDisabled()}
        variant="ghost"
        class={cn([
          classes(),
          local.slotProps?.button?.class,
        ])}
        slotProps={{
          startIcon: local.slotProps?.button?.slotProps?.startIcon,
          endIcon: local.slotProps?.icon,
        }}
        fullWidth
      >
        {local.children}
      </Button>
    </div>
  );
};

export default AccordionSummary;