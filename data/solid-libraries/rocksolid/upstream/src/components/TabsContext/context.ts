import {
  type Accessor,
  createContext,
  useContext,
} from "solid-js";

export type TabsContextValue = {
  activeTabValue: Accessor<string>;
  handleChange: (event: Event, tabName: string) => void;
  tabId: Accessor<string|undefined>;
};

export const Tabs_Context = (
  createContext<TabsContextValue>()
);

export const useTabsContext = (
  componentName: string,
) => {
  const context = useContext(Tabs_Context);
  if (!context) {
    throw new Error(`
      ${componentName} must be used inside TabsContext component.
    `.trim());
  }
  return context;
};