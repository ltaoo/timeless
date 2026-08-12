import { ui } from "@timeless/timeless";
import { ViewProps, ViewChildren } from "@timeless/timeless";
import { classNames, Ref } from "@timeless/timeless";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  default: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  large: "h-12 w-12 text-base",
};

export function Avatar(
  props: ViewProps & {
    src: string | Ref<string>;
    alt?: string;
    size?: Parameters<typeof ui.AvatarPrimitive.Root>[0]["size"];
    fallback?: string;
  },
  children?: ViewChildren,
) {
  const { src, alt, fallback, size = "default", class: cls, ...rest } = props;

  return ui.AvatarPrimitive.Root(
    {
      ...rest,
      size,
      class: classNames([
        "relative flex shrink-0 overflow-hidden rounded-full",
        SIZES[size] || SIZES.default,
        cls,
      ]),
    },
    [
      ui.AvatarPrimitive.Image({
        src,
        alt,
        class: "aspect-square h-full w-full object-cover",
        onLoadingStatusChange: () => {
          // Image handles visibility internally based on error state
        },
      }),
      ui.AvatarPrimitive.Fallback(
        {
          class:
            "flex h-full w-full items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium",
        },
        children ?? [fallback || (alt ? alt.charAt(0).toUpperCase() : "?")],
      ),
    ],
  );
}
