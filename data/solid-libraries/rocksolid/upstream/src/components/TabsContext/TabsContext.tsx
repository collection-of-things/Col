import {
  type JSXElement,
  createSignal,
} from "solid-js";
import {
  type TabsContextValue,
  Tabs_Context,
} from "./context";

export type TabsContextProps = {
  children?: JSXElement;
  defaultValue?: string;
  onChange?: (event: Event, activeTab: string) => void;
  value?: string;
  tabId?: string;
};

const TabsContext = (
  props: TabsContextProps
) => {
  
  const isControlled = typeof props.value !== "undefined";

  const [localValue, setLocalValue] = createSignal(props.defaultValue || "");

  const activeTabValue = () => isControlled ? props.value! : localValue();

  const handleChange = (
    event: Event,
    tab: string,
  ) => {
    if (!isControlled) {
      setLocalValue(tab);
    }
    props.onChange?.(event, tab);  
  };

  const conextValue: TabsContextValue = {
    activeTabValue,
    handleChange,
    tabId: () => props.tabId,
  };

  return (
    <Tabs_Context.Provider
      value={conextValue}
    >
      {props.children}
    </Tabs_Context.Provider>
  );
};

export default TabsContext;