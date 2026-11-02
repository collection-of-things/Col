export interface ExtendedThemeRounded {};

export type ThemeRounded = {
  none: string,
  small: string,
  medium: string,
  large: string,
  full: string,
} & ExtendedThemeRounded;

const rounded: ThemeRounded = {
  none: "rounded-none",
  small: "rounded-sm",
  medium: "rounded-md",
  large: "rounded-lg",
  full: "rounded-full",
};

export default rounded;