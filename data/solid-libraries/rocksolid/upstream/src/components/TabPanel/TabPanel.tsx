import {
  type ComponentProps,
  createMemo,
  splitProps,
} from "solid-js";
import {
  useTabsContext,
} from "@/components/TabsContext/context";
import cn from "@/components/utils/cn";

export type TabPanelProps = {
  class?: string;
  value: string;
} & ComponentProps<"div">;

const TabPanel = (
  props: TabPanelProps,
) => {

  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "value",
  ]);

  const tabsContextValue = useTabsContext("TabPanel");

  const isActive = createMemo(() => (
    local.value === tabsContextValue.activeTabValue()
  ));

  const ariaLabelledby = createMemo(() => {
    const tabId = tabsContextValue.tabId();
    if (tabId) {
      return `${tabId}-tab-${local.value}`;
    }
    return undefined;
  });

  const id = createMemo(() => {
    const tabId = tabsContextValue.tabId();
    if (tabId) {
      return `${tabId}-tabpanel-${local.value}`;
    }
    return undefined;
  });

  return (
    <div
      aria-labelledby={ariaLabelledby()}
      id={id()}
      role="tabpanel"  
      {...rest}
      hidden={!isActive()}
      class={cn(
        local.class,
      )}
    >
      {local.children}
    </div>
  );
};

export default TabPanel;