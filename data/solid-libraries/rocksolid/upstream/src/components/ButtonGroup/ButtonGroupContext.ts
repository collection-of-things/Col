import {
  type Accessor,
  createContext,
  useContext,
} from "solid-js";
import type {
  ThemeColors
} from "@/components/styles/theme/colors";
import {
  type ButtonProps,
} from "@/components/Button";

export type ButtonGroupContextValue = {
  color: Accessor<keyof ThemeColors>;
  disabled: Accessor<ButtonProps["disabled"]>;
  fullWidth: Accessor<ButtonProps["fullWidth"]>;
  size: Accessor<ButtonProps["size"]>;
  variant: Accessor<ButtonProps["variant"]>;
};

export const ButtonGroupContext = createContext<ButtonGroupContextValue>();

export const useButtonGroupContext = () => {
  return useContext(ButtonGroupContext);
};