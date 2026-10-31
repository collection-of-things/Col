import {
  type Accessor,
  createContext,
  useContext,
} from "solid-js";

export type AccordionContextValue = {
  accordionId: Accessor<string | undefined>;
  isDisabled: Accessor<boolean>;
  disableTransition: Accessor<boolean>;
  isExpanded: Accessor<boolean>;
  onToggleExpand: (event: Event) => void;
};

export const AccordionContext = createContext<AccordionContextValue>();

export const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(`
      AccordionSummary and AccordionDetails must be used inside an Accordion component.
    `.trim());
  }
  return context;
};