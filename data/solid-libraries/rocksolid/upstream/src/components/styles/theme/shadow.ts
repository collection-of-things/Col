export interface ExtendedThemeShadow {};

export type ThemeShadow = {
  none: string;
  small: string;
  medium: string;
  large: string;
} & ExtendedThemeShadow;

const shadow: ThemeShadow = {
  none: "shadow-none",
  small: "shadow-sm dark:shadow-[0_1px_2px_0_rgba(0,0,0,0.4)]",
  medium: "shadow dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.5)]",
  large: "shadow-lg dark:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.6)]",
};

export default shadow;