import {
  type ComponentProps,
  createMemo,
  mergeProps,
  splitProps,
} from "solid-js";
import {
  type VariantProps,
} from "tailwind-variants";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import cn from "@/components/utils/cn";
import cardDefaultStyles from "./style";

type CardVariants = VariantProps<typeof cardDefaultStyles>;

export type CardProps = {
  variant?: CardVariants["variant"];
  class?: string;
} & ComponentProps<"div">;

const Card = (
  props: CardProps,
) => {

  const mergedProps = mergeProps({
    variant: "outlined" as const,
  }, props);

  const [local, rest] = splitProps(mergedProps, [
    "children",
    "class",
    "variant",
  ]);

  const themeContextValue = useThemeContext();

  const classes = createMemo(() => {
    const state = {
      variant: local.variant,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.card(state);
    }
    return cardDefaultStyles(state);
  });

  return (
    <div
      {...rest}
      class={cn(
        classes(),
        local.class,
      )}
    >
      {local.children}
    </div>
  );
};

export default Card;