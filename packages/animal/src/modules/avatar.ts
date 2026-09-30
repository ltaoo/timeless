import { ui } from "@timeless/timeless";
import { Ref, ViewChildren, ViewProps, classNames } from "@timeless/timeless";

const SIZE_CLASSES: Record<string, string> = {
  sm: "animal-avatar--sm",
  default: "animal-avatar--default",
  lg: "animal-avatar--lg",
  large: "animal-avatar--lg",
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
        "animal-avatar",
        SIZE_CLASSES[size] || SIZE_CLASSES.default,
        cls,
      ]),
    },
    [
      ui.AvatarPrimitive.Image({
        src,
        alt,
        class: "animal-avatar__image",
      }),
      ui.AvatarPrimitive.Fallback(
        { class: "animal-avatar__fallback" },
        children ?? [fallback || (alt ? alt.charAt(0).toUpperCase() : "?")],
      ),
    ],
  );
}
