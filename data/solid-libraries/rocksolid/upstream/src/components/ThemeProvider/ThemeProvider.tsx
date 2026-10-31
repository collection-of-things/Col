import  {
  type JSXElement,
  splitProps,
} from "solid-js";
import {
  type Theme,
} from "@/components/styles/theme/";
import ComponentsTVs, {
  type ComponentsTV,
} from "./componentsTV";
import {
  ThemeContext,
} from "./ThemeContext";

export type ThemeProviderProps = {
  theme: Theme,
  children?: JSXElement;
};

const ThemeProvider = (
  props: ThemeProviderProps,
) => {

  const [local] = splitProps(props, [
    "theme",
    "children",
  ]);

  const componentsTV = (
    Object.fromEntries(
      Object.entries(ComponentsTVs)
      .map(([key, fn]) => [key, fn(local.theme)])
    ) as ComponentsTV
  );

  const themeContextValue = {
    theme: local.theme,
    componentsTV,
  };

  return (
    <ThemeContext.Provider
      value={themeContextValue}
    >
      {local.children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;