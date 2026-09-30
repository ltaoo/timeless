import { ui } from "@timeless/timeless";
import { Ref, ViewChildren, ViewProps, classNames } from "@timeless/timeless";

const SIZE_CLASSES: Record<string, string> = {
  sm: "fl-avatar--sm",
  default: "fl-avatar--default",
  lg: "fl-avatar--lg",
  large: "fl-avatar--lg",
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
        "fl-avatar",
        SIZE_CLASSES[size] || SIZE_CLASSES.default,
        cls,
      ]),
    },
    [
      ui.AvatarPrimitive.Image({
        src,
        alt,
        class: "fl-avatar__image",
      }),
      ui.AvatarPrimitive.Fallback(
        { class: "fl-avatar__fallback" },
        children ?? [fallback || (alt ? alt.charAt(0).toUpperCase() : "?")],
      ),
    ],
  );
}
