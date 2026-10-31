import {
  type ComponentProps,
  type JSXElement,
  type ValidComponent,
  createMemo,
  mergeProps,
  splitProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  type Prettify,
} from "@/components/types/Prettify";
import  {
  type WithExtendedComponentProps
} from "@/components/types/ExtendedComponentProps";
import { type VariantProps } from "tailwind-variants";
import Typography,{
  type TypographyProps,
} from "@/components/Typography";
import IconButton, {
  type IconButtonProps,
} from "@/components/IconButton";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import type {
  ThemeColors
} from "@/components/styles/theme/colors";
import cn from "@/components/utils/cn";
import AlertIcon from "@/components/icons/Alert";
import ErrorIcon from "@/components/icons/Error";
import CheckmarkIcon from "@/components/icons/Checkmark";
import InfoIcon from "@/components/icons/Info";
import WarningIcon from "@/components/icons/Warning";
import CrossIcon from "@/components/icons/Cross";
import alertDefaultStyles from "./style";

type AlertVariants = VariantProps<typeof alertDefaultStyles>;

type AlertSlotProps = Prettify<{
  icon?: Prettify<TypographyProps & WithExtendedComponentProps>;
  content?: Prettify<TypographyProps & WithExtendedComponentProps>;
  action?: Prettify<ComponentProps<"div"> & WithExtendedComponentProps>;
  closeButton?: Prettify<Omit<IconButtonProps, "as"> & WithExtendedComponentProps>; 
}>;

export type AlertProps<T extends ValidComponent = "div"> = {
  action?: JSXElement;
  as?: T;
  children?: JSXElement;
  class?: string;
  color?: keyof ThemeColors;
  icon?: JSXElement;
  onClose?: (event: MouseEvent) => void;
  slotProps?: AlertSlotProps;
  variant?: AlertVariants["variant"];
} & Omit<ComponentProps<T>, "onClose">;

const Alert = <T extends ValidComponent = "div">(
  props: AlertProps<T>,
) => {

  const merged = mergeProps({
    color: "default" as const,
    variant: "filled" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "as",
    "action",
    "children",
    "class",
    "color",
    "icon",
    "onClose",
    "slotProps",
    "variant",
  ]);

  const themeContextValue = useThemeContext();

  const icon = createMemo(() => {
    if (local.icon === null) {
      return;
    }
    if (local.icon) {
      return local.icon;
    }
    switch(local.color) {
      case "success":
        return <CheckmarkIcon />;
      case "info":
        return <InfoIcon />;
      case "warning":
        return <WarningIcon />;
      case "error":
        return <ErrorIcon />;
      default:
        return <AlertIcon />
    }
  });

  const classes = createMemo(() => {
    const state = {
      color: local.color,
      variant: local.variant,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.alert(state);
    }
    return alertDefaultStyles(state);
  });

  const slotProps = createMemo(() => (
    local.slotProps as (AlertSlotProps | undefined)
  ));

  return (
    <Dynamic
      role="alert"
      {...rest}
      component={local.as ?? "div"}
      class={cn(
        classes().base(),
        local.class,
      )}
    >
      {icon() ? (
        <Typography
          as="span"
          {...slotProps()?.icon}
          class={cn(
            classes().icon(),
            slotProps()?.icon?.class,
          )}
        >
          {icon()}
        </Typography>
      ) : null}
      <Typography 
        as="div"
        variant="inherit"
        {...slotProps()?.content}
        class={cn(
          classes().content(),
          slotProps()?.content?.class,
        )}
      >
        {local.children}
      </Typography>
      {local.action ? (
        <div
          {...slotProps()?.action}
        >
          {local.action}
        </div>
      ) : null}
      {typeof local.onClose === "function" ? (
        <IconButton
          aria-label="Close"
          color={local.color}
          size="small"
          {...slotProps()?.closeButton}
          onClick={local.onClose}
          class={cn(
            classes().closeButton(),
            slotProps()?.closeButton?.class,
          )}
        >
          <CrossIcon />
        </IconButton>
      ) : null}
    </Dynamic>
  );
};

export default Alert;