import {
  type JSXElement,
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
import {
  useTabsContext,
} from "@/components/TabsContext/context";
import {
  useTabsContentContext
} from "@/components/Tabs/TabsContentContext";
import Button, {
  type ButtonProps,
} from "@/components/Button";
import cn from "@/components/utils/cn";
import tabDefaultStyles from "./style";

type TabVariants = VariantProps<typeof tabDefaultStyles>;

type TabSlotProps = {
  icon?: NonNullable<ButtonProps["slotProps"]>["startIcon"];
};

export type TabProps = {
  class?: string;
  icon?: JSXElement;
  iconPosition?: TabVariants["iconPosition"];
  label?: string;
  value: string;
  slotProps?: TabSlotProps;
} & Omit<
  ButtonProps,
  "fullWidth" | "variant" | "color" | "slotProps"
>;

const Tab = (
  props: TabProps,
) => {

  const merged = mergeProps({
    iconPosition: "top" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "class",
    "icon",
    "iconPosition",
    "label",
    "value",
    "slotProps",
    // Skip props
    "children",
  ]);

  const themeContextValue = useThemeContext();

  const tabsContextValue = useTabsContext("Tab");

  const tabsContentContext = useTabsContentContext();

  const isSelected = createMemo(() => (
    tabsContextValue.activeTabValue() === local.value
  ));

  const handleTabClick = (event: Event) => {
    tabsContextValue.handleChange(event, local.value);
  };

  const classes = createMemo(() => {
    const state = {
      selected: isSelected(),
      orientation: (
        tabsContentContext?.orientation() ?? "horizontal"
      ),
      iconPosition: local.iconPosition,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.tab(state);
    }
    return tabDefaultStyles(state);
  });

  const ariaControls = createMemo(() => {
    const tabId = tabsContextValue.tabId();
    if (tabId) {
      return `${tabId}-tabpanel-${local.value}`;
    }
    return undefined;
  });

  const id = createMemo(() => {
    const tabId = tabsContextValue.tabId();
    if (tabId) {
      return `${tabId}-tab-${local.value}`;
    }
    return undefined;
  });
  
  return (
    <Button
      aria-controls={ariaControls()}
      aria-selected={isSelected()}
      id={id()}
      role="tab"
      tabIndex={isSelected() ? 0 : -1}
      {...rest}
      as="button"
      onClick={handleTabClick}
      variant="ghost"
      class={cn(
        classes(),
        local.class,
      )}
      startIcon={local.icon}
      slotProps={{
        startIcon: local.slotProps?.icon,
      }}
    >
      {local.label}
    </Button>
  );
};

export default Tab;