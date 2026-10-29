import  {
  createContext,
  useContext,
} from "solid-js";
import {
  type ComponentsTV,
} from "./componentsTV";
import {
  type Theme
} from "@/components/styles/theme/";

export type ThemeContextValue = {
  theme: Theme;
  componentsTV: ComponentsTV;
};

export const ThemeContext = (
  createContext<ThemeContextValue>()
);

export const useThemeContext = () => {
  return useContext(ThemeContext);
};