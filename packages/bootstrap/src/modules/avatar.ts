import { ui } from "@timeless/timeless";
import {
  Ref,
  ViewChildren,
  ViewProps,
  classNames,
} from "@timeless/timeless";

const SIZE_CLASSES: Record<string, string> = {
  sm: "avatar-sm",
  default: "avatar-default",
  lg: "avatar-lg",
  large: "avatar-lg",
};

export function Avatar(
  props: ViewProps & {
    src: string | Ref<string>;
    alt?: string;
    size?: "sm" | "default" | "lg" | "large";
    fallback?: string;
  },
  children?: ViewChildren,
) {
  const { src, alt, fallback, size = "default", class: cls, ...rest } = props;

  return ui.AvatarPrimitive.Root(
    {
      ...rest,
      size: (size === "lg" || size === "large" ? "large" : "default") as any,
      class: classNames(["avatar", SIZE_CLASSES[size] || SIZE_CLASSES.default, cls]),
    },
    [
      ui.AvatarPrimitive.Image({
        src,
        alt,
        class: "avatar-image",
      }),
      ui.AvatarPrimitive.Fallback(
        { class: "avatar-fallback" },
        children ?? [fallback || (alt ? alt.charAt(0).toUpperCase() : "?")],
      ),
    ],
  );
}
