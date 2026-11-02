import {
  type ComponentProps,
  type ValidComponent,
  splitProps,
  mergeProps,
  createMemo,
  createSignal,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  type Prettify,
} from "@/components/types/Prettify";
import  {
  type WithExtendedComponentProps
} from "@/components/types/ExtendedComponentProps";
import {
  type VariantProps,
} from "tailwind-variants";
import {
  useThemeContext,
} from "@/components/ThemeProvider/";
import type {
  ThemeColors
} from "@/components/styles/theme/colors";
import cn from "@/components/utils/cn";
import avatarDefaultStyles from "./style";

const getAvatarLetters = (
  name: string,
): string  => (
  name
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .map(word => word[0])
  .slice(0, 2)
  .join("")
  .toUpperCase()
);

type AvatarVariants = VariantProps<typeof avatarDefaultStyles>;

type AvatarSlotProps = Prettify<{
  img?: Prettify<ComponentProps<"img"> & WithExtendedComponentProps>;
}>;

export type AvatarProps<T extends ValidComponent = "div"> = {
  alt?: string;
  as?: T;
  class?: string;
  color?: keyof ThemeColors;
  rounded?: AvatarVariants["rounded"]; 
  size?: AvatarVariants["size"];
  slotProps?: AvatarSlotProps;
  src?: string;
} & ComponentProps<T>;

const Avatar = <T extends ValidComponent = "div">(
  props: AvatarProps<T>,
) => {

  const merged = mergeProps({
    color: "default" as const,
    rounded: "full" as const,
    size: "medium" as const,
  }, props);

  const [local, rest] = splitProps(merged, [
    "as",
    "alt",
    "class",
    "color",
    "children",
    "rounded",
    "size",
    "slotProps",
    "src",
  ]);

  const themeContextValue = useThemeContext();

  const [isShowImage, setIsShowImage] = createSignal(
    local.src && typeof local.src === "string"
  );

  const avatarLetters = createMemo(() => (
    getAvatarLetters(local.alt || local.children || "")
  ));

  const handleImageError = (event: ErrorEvent) => {
    setIsShowImage(false);
    local.slotProps?.img?.onError(event);
  };

  const classes = createMemo(() => {
    const state = {
      rounded: local.rounded,
      color: local.color,
      size: local.size,
    };
    if (themeContextValue) {
      return themeContextValue.componentsTV.avatar(state);
    }
    return avatarDefaultStyles(state);
  });

  return (
    <Dynamic
      {...rest}
      component={local.as ?? "div"}
      class={cn(
        classes().base(),
        local.class,
      )}
    >
      {isShowImage() ? (
        <img
          {...local.slotProps?.img}
          src={local.src}
          alt={avatarLetters()}
          onError={handleImageError}
          class={cn(
            classes().img(),
            local.slotProps?.img?.class,
          )}
        />
      ) : avatarLetters()}
    </Dynamic>
  );
};

export default Avatar;