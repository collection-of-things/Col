export interface ExtendedThemeColors {};

export type ThemeColorStateTokens = {
  background: string;
  text: string;
  border: string;
  hover: string;
  active: string;
};

export type ThemeColorVariants = {
  solid: ThemeColorStateTokens;
  filled: ThemeColorStateTokens;
  outlined: ThemeColorStateTokens;
  ghost: ThemeColorStateTokens;
};

export type ThemeColors = {
  default: ThemeColorVariants;
  success: ThemeColorVariants;
  warning: ThemeColorVariants;
  info: ThemeColorVariants;
  error: ThemeColorVariants;
} & ExtendedThemeColors;

const colors: ThemeColors = {
  default: {
    solid: {
      background: "bg-neutral-900 dark:bg-neutral-100",
      text: "text-neutral-50 dark:text-neutral-950",
      border: "border-transparent",
      hover: "hover:bg-neutral-800 dark:hover:bg-neutral-200",
      active: "active:bg-neutral-950 dark:active:bg-neutral-300",
    },
    filled: {
      background: "bg-neutral-200/70 dark:bg-neutral-800",
      text: "text-neutral-900 dark:text-neutral-100",
      border: "border-transparent",
      hover: "hover:bg-neutral-200 dark:hover:bg-neutral-700",
      active: "active:bg-neutral-300 dark:active:bg-neutral-600",
    },
    outlined: {
      background: "bg-transparent",
      text: "text-neutral-800 dark:text-neutral-200",
      border: "border-neutral-400 dark:border-neutral-500",
      hover: "hover:bg-neutral-100 dark:hover:bg-neutral-800/80",
      active: "active:bg-neutral-200/80 dark:active:bg-neutral-700/80",
    },
    ghost: {
      background: "bg-transparent",
      text: "text-neutral-800 dark:text-neutral-200",
      border: "border-transparent",
      hover: "hover:bg-neutral-100 dark:hover:bg-neutral-800/80",
      active: "active:bg-neutral-200/80 dark:active:bg-neutral-700/80",
    },
  },

  success: {
    solid: {
      background: "bg-emerald-600 dark:bg-emerald-500",
      text: "text-white dark:text-neutral-950",
      border: "border-transparent",
      hover: "hover:bg-emerald-700 dark:hover:bg-emerald-400",
      active: "active:bg-emerald-800 dark:active:bg-emerald-300",
    },
    filled: {
      background: "bg-emerald-100 dark:bg-emerald-950/90",
      text: "text-emerald-900 dark:text-emerald-200",
      border: "border-transparent",
      hover: "hover:bg-emerald-200/80 dark:hover:bg-emerald-900",
      active: "active:bg-emerald-300/80 dark:active:bg-emerald-850",
    },
    outlined: {
      background: "bg-transparent",
      text: "text-emerald-800 dark:text-emerald-300",
      border: "border-emerald-800 dark:border-emerald-300",
      hover: "hover:bg-emerald-50 dark:hover:bg-emerald-950/60",
      active: "active:bg-emerald-100 dark:active:bg-emerald-900/80",
    },
    ghost: {
      background: "bg-transparent",
      text: "text-emerald-800 dark:text-emerald-300",
      border: "border-transparent",
      hover: "hover:bg-emerald-50 dark:hover:bg-emerald-950/60",
      active: "active:bg-emerald-100 dark:active:bg-emerald-900/80",
    },
  },

  warning: {
    solid: {
      background: "bg-amber-500 dark:bg-amber-400",
      text: "text-amber-950 dark:text-amber-950",
      border: "border-transparent",
      hover: "hover:bg-amber-600 dark:hover:bg-amber-300",
      active: "active:bg-amber-700 dark:active:bg-amber-200",
    },
    filled: {
      background: "bg-amber-100 dark:bg-amber-950/90",
      text: "text-amber-950 dark:text-amber-200",
      border: "border-transparent",
      hover: "hover:bg-amber-200/80 dark:hover:bg-amber-900",
      active: "active:bg-amber-300/80 dark:active:bg-amber-850",
    },
    outlined: {
      background: "bg-transparent",
      text: "text-amber-900 dark:text-amber-300",
      border: "border-amber-900 dark:border-amber-300",
      hover: "hover:bg-amber-50 dark:hover:bg-amber-950/60",
      active: "active:bg-amber-100 dark:active:bg-amber-900/80",
    },
    ghost: {
      background: "bg-transparent",
      text: "text-amber-900 dark:text-amber-300",
      border: "border-transparent",
      hover: "hover:bg-amber-50 dark:hover:bg-amber-950/60",
      active: "active:bg-amber-100 dark:active:bg-amber-900/80",
    },
  },

  info: {
    solid: {
      background: "bg-blue-600 dark:bg-blue-500",
      text: "text-white dark:text-neutral-950",
      border: "border-transparent",
      hover: "hover:bg-blue-700 dark:hover:bg-blue-400",
      active: "active:bg-blue-800 dark:active:bg-blue-300",
    },
    filled: {
      background: "bg-blue-100 dark:bg-blue-950/90",
      text: "text-blue-950 dark:text-blue-200",
      border: "border-transparent",
      hover: "hover:bg-blue-200/80 dark:hover:bg-blue-900",
      active: "active:bg-blue-300/80 dark:active:bg-blue-850",
    },
    outlined: {
      background: "bg-transparent",
      text: "text-blue-800 dark:text-blue-300",
      border: "border-blue-800 dark:border-blue-300",
      hover: "hover:bg-blue-50 dark:hover:bg-blue-950/60",
      active: "active:bg-blue-100 dark:active:bg-blue-900/80",
    },
    ghost: {
      background: "bg-transparent",
      text: "text-blue-800 dark:text-blue-300",
      border: "border-transparent",
      hover: "hover:bg-blue-50 dark:hover:bg-blue-950/60",
      active: "active:bg-blue-100 dark:active:bg-blue-900/80",
    },
  },

  error: {
    solid: {
      background: "bg-red-600 dark:bg-red-500",
      text: "text-white dark:text-neutral-950",
      border: "border-transparent",
      hover: "hover:bg-red-700 dark:hover:bg-red-400",
      active: "active:bg-red-800 dark:active:bg-red-300",
    },
    filled: {
      background: "bg-red-100 dark:bg-red-950/90",
      text: "text-red-950 dark:text-red-200",
      border: "border-transparent",
      hover: "hover:bg-red-200/80 dark:hover:bg-red-900",
      active: "active:bg-red-300/80 dark:active:bg-red-850",
    },
    outlined: {
      background: "bg-transparent",
      text: "text-red-800 dark:text-red-300",
      border: "border-red-800 dark:border-red-300",
      hover: "hover:bg-red-50 dark:hover:bg-red-950/60",
      active: "active:bg-red-100 dark:active:bg-red-900/80",
    },
    ghost: {
      background: "bg-transparent",
      text: "text-red-800 dark:text-red-300",
      border: "border-transparent",
      hover: "hover:bg-red-50 dark:hover:bg-red-950/60",
      active: "active:bg-red-100 dark:active:bg-red-900/80",
    },
  },
};

export default colors;