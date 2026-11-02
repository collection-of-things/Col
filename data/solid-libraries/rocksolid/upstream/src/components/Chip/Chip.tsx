import {
  type ComponentProps,
  type JSXElement,
  createMemo,
  mergeProps,
  splitProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  type Prettify,
} from "@/components/types/Prettify";
import {
  type WithExtendedComponentProps
} from "@/components/types/ExtendedComponentProps";
import {
  type VariantProps,
} from "tailwind-variants";
import Typography, {
  type TypographyProps,
} from "@/components/Typography/Typography";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import type {
  ThemeColors
} from "@/components/styles/theme/colors";
import CrossIcon from "@/components/icons/Cross";
import cn from "@/components/utils/cn";
import chipDefaultStyles from "./style";

type ChipVariants = VariantProps<typeof chipDefaultStyles>;

type ChipSlotProps = Prettify<{
  deleteIcon?: Prettify<ComponentProps<"span"> & WithExtendedComponentProps>,
  label?: Prettify<TypographyProps<"span"> & WithExtendedComponentProps>,
}>;

export type ChipProps = {
  avatar?: JSXElement;
  color?: keyof ThemeColors;
  deleteIcon?: JSXElement;
  disabled?: ChipVariants["disabled"];
  icon?: JSXElement;
  label: string;
  onClick?: (event: MouseEvent) => void;
  onDelete?: (event: MouseEvent) => void;
  size?: ChipVariants["size"];
  slotProps?: ChipSlotProps;
  variant?: ChipVariants["variant"];
} & Omit<ComponentProps<"div">, "onClick">;

const Chip = (
  props: ChipProps,
) => {

  const merged = mergeProps({
    color: "default" as const,
    variant: "filled" as const,
    size: "medium" as const,
    disabled: false as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "avatar",
    "class",
    "color",
    "deleteIcon",
    "disabled",
    "icon",
    "label",
    "onClick",
    "onDelete",
    "slotProps",
    "variant",
    "size",
    // Skip props
    "children",
  ]);

  const themeContextValue = useThemeContext();

  const startElement = createMemo(() => {
    if (local.avatar) return local.avatar;
    if (local.icon) return local.icon;
    return null;
  });

  const hasAvatarElement = createMemo(() => (
    !!local.avatar
  ));

  const hasDeleteElement = createMemo(() => (
    typeof local.onDelete === "function"
  ));

  const isClickable = createMemo(() => (
    typeof local.onClick === "function"
  ));

  const handleDeleteIconClick = (
    event: MouseEvent,
  ) => {
    if (local.disabled) return;
    event.stopPropagation();
    local.onDelete?.(event);
  };

  const classes = createMemo(() => {
    const state = {
      color: local.color,
      disabled: local.disabled,
      variant: local.variant,
      size: local.size,
      hasAvatarElement: hasAvatarElement(),
      hasDeleteIcon: hasDeleteElement(),
      clickable: isClickable(),
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.chip(state);
    }
    return chipDefaultStyles(state);
  });

  const deleteElement = createMemo(() => {
    if (!hasDeleteElement()) return null;
    if (local.deleteIcon) return local.deleteIcon;
    return <CrossIcon />;
  });

  return (
    <Dynamic
      {...rest}
      component={isClickable() ? "button" : "div"}
      aria-disabled={local.disabled}
      onClick={!local.disabled ? local.onClick : undefined}
      tabIndex={(isClickable() && !local.disabled) ? 0 : -1}
      class={cn(
        classes().base(),
        local.class,
      )}
    >
      {startElement()}
      <Typography
        {...local.slotProps?.label}
        as="span"
        variant="inherit"
        truncate
        class={cn(
          classes().label(),
          local.slotProps?.label?.class,
        )}
      >
        {local.label}
      </Typography>
      <span
        {...local.slotProps?.deleteIcon}
        class={cn(
          classes().deleteIcon(),
          local.slotProps?.deleteIcon?.class,
        )}
        onClick={handleDeleteIconClick}
      >
        {deleteElement()}
      </span>
    </Dynamic>
  );
};

export default Chip;