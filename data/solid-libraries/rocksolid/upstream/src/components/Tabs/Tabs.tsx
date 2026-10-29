import {
  type ComponentProps,
  createMemo,
  mergeProps,
  splitProps,
} from "solid-js";
import {
  type VariantProps,
} from "tailwind-variants";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import cn from "@/components/utils/cn";
import {
  TabsContentContext,
} from "./TabsContentContext";
import tabsDefaultStyles from "./style";

type TabsVariants = VariantProps<typeof tabsDefaultStyles>;

export type TabsProps = {
  centered?: boolean;
  class?: string;
  onKeyDown?: (event: KeyboardEvent) => void;
  orientation?: TabsVariants["orientation"];
} & Omit<
  ComponentProps<"div">,
  "onKeyDown"
>;

const Tabs = (
  props: TabsProps,
) => {

  const merged = mergeProps({
    centered: false,
    orientation: "horizontal" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "centered",
    "children",
    "class",
    "onKeyDown",
    "orientation",
  ]);

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    const state = {
      centered: local.centered,
      orientation: local.orientation,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.tabs(state);
    }
    return tabsDefaultStyles(state);
  });

  const focusTab = (tab: HTMLElement) => {
    tab.focus();
  };

  const handleTabListKeyDown = (event: KeyboardEvent) => {
    if (![
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ].includes(event.key)) {
      local.onKeyDown?.(event);
      return;
    }
    
    const tabs = ((Array.from((
      event.currentTarget as HTMLElement
    ).querySelectorAll("[role=tab]"))) as HTMLButtonElement[])
    .filter((tab) => (
      tab.disabled !== true &&
      tab.getAttribute("aria-disabled") !== "true"
    ));

    const activeTabIndex = Math.max(
      tabs.findIndex(tab => (
        document.activeElement ===  tab
      )), 
      0
    );

    switch (event.key) {
      case "ArrowLeft":
        focusTab(activeTabIndex === 0 ? (
          tabs[tabs.length - 1]
        ) : (
          tabs[activeTabIndex - 1]
        ));
        break
      case "ArrowRight": {
        focusTab(activeTabIndex === (tabs.length - 1) ? (
          tabs[0]
        ) : (
          tabs[activeTabIndex + 1]
        ));
        break;
      };
      case "Home": {
        focusTab(tabs[0]);
        break;
      };
      case "End": {
        focusTab(tabs[tabs.length - 1]);
        break;
      };
    }
    local.onKeyDown?.(event);
  };

  const tabsContextValue = {
    orientation: () => local.orientation,
  };

  return (
    <div
      role="tablist"
      {...rest}
      class={cn(
        classes().base(),
        local.class,
      )}
      onKeyDown={handleTabListKeyDown}
    >
      <TabsContentContext.Provider
        value={tabsContextValue}
      >
        {local.children}
      </TabsContentContext.Provider>
    </div>
  );
};

export default Tabs;