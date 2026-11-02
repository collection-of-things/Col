export interface ExtendedThemeTypography {};
export interface ExtendedThemeTypographyColors {};
export interface ExtendedThemeTypographyVariants {};

export type ThemeTypographyColors = {
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
} & ExtendedThemeTypographyColors;

export type ThemeTypographyVariants = {
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  h5: string;
  h6: string;
  body1: string;
  body2: string;
  code: string;
  inherit: string;
} & ExtendedThemeTypographyVariants;

export type ThemeTypography = {
  colors: ThemeTypographyColors;
  variants: ThemeTypographyVariants;
} & ExtendedThemeTypography; 

const typography: ThemeTypography = {
  variants: {
    h1: "text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight",
    h2: "text-3xl sm:text-4xl font-bold tracking-tight leading-snug",
    h3: "text-2xl sm:text-3xl font-bold tracking-tight leading-snug",
    h4: "text-xl sm:text-2xl font-semibold tracking-tight leading-normal",
    h5: "text-lg font-semibold tracking-normal leading-normal",
    h6: "text-base font-semibold tracking-normal leading-normal",
    body1: "text-base font-normal leading-relaxed tracking-normal",
    body2: "text-sm font-normal leading-normal tracking-normal",
    code: "font-mono text-sm font-normal leading-relaxed",
    inherit: "font-[inherit] leading-[inherit] tracking-[inherit]",
  },
  colors: {
    textPrimary: "text-neutral-900 dark:text-neutral-50",
    textSecondary: "text-neutral-600 dark:text-neutral-300",
    textTertiary: "text-neutral-500 dark:text-neutral-400",
  },
};

export default typography;