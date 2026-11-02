import {
  type Accessor,
  createContext,
  useContext,
} from "solid-js";

type TabsContextValue = {
  orientation: Accessor<"horizontal" | "vertical">;
}

export const TabsContentContext = (
  createContext<TabsContextValue>()
);

export const useTabsContentContext = () => {
  return useContext(TabsContentContext);
};