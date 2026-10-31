import colors, { type ThemeColors } from "./colors";
import disabled, { type ThemeDisabled } from "./disabled";
import rounded, { type ThemeRounded } from "./rounded";
import shadow, { type ThemeShadow } from "./shadow";
import typography, {type ThemeTypography} from "./typography";
import utils, { type ThemeUtils } from "./utilities";

export interface ExtendedTheme {};

export type Theme = {
  colors: ThemeColors;
  disabled: ThemeDisabled;
  divider: ThemeUtils["divider"];
  focus: ThemeUtils["focus"];
  focusWithin: ThemeUtils["focusWithin"];
  rounded: ThemeRounded;
  typography: ThemeTypography;
  shadow: ThemeShadow;
} & ExtendedTheme;

const theme: Theme = {
  colors,
  disabled,
  rounded,
  shadow,
  typography,
  ...utils,
};

export default theme;