export interface ExtendedThemeDisabled {};

export type ThemeDisabled = {
  text: string;
  background: string;
  border: string;
  state: string;
} & ExtendedThemeDisabled;

const disabled: ThemeDisabled =  {
  text: "text-neutral-400 dark:text-neutral-600",
  background: "bg-neutral-100 dark:bg-neutral-800",
  border: "border-neutral-200 dark:border-neutral-800",
  state: "cursor-not-allowed pointer-events-none",
};

export default disabled;