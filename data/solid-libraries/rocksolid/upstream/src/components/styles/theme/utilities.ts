export type ThemeUtils = {
  divider: string;
  focus: string;
  focusWithin: string;
};

const utils: ThemeUtils = {
  divider: "border-neutral-300 dark:border-neutral-700",
  focus:
    "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_#2563eb,0_0_0_4px_rgba(37,99,235,0.45)] dark:focus-visible:shadow-[0_0_0_1px_#60a5fa,0_0_0_4px_rgba(96,165,250,0.45)]",
  focusWithin:
    "focus-within:shadow-[0_0_0_1px_#2563eb,0_0_0_4px_rgba(37,99,235,0.45)] dark:focus-within:shadow-[0_0_0_1px_#60a5fa,0_0_0_4px_rgba(96,165,250,0.45)]",
};

export default utils;