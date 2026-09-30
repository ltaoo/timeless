import { ui } from "@timeless/timeless";
import { Ref, ViewChildren, ViewProps, classNames } from "@timeless/timeless";

const SIZE_CLASSES: Record<string, string> = {
  sm: "m3-avatar--sm",
  default: "m3-avatar--default",
  lg: "m3-avatar--lg",
  large: "m3-avatar--lg",
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
      class: classNames([
        "m3-avatar",
        SIZE_CLASSES[size] || SIZE_CLASSES.default,
        cls,
      ]),
    },
    [
      ui.AvatarPrimitive.Image({
        src,
        alt,
        class: "m3-avatar__image",
      }),
      ui.AvatarPrimitive.Fallback(
        { class: "m3-avatar__fallback" },
        children ?? [fallback || (alt ? alt.charAt(0).toUpperCase() : "?")],
      ),
    ],
  );
}
