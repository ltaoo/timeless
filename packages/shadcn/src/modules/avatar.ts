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
        // relative + z-1：图片层要压在兜底层之上（两层都在定位层里，DOM 靠后的
        // Fallback 默认会盖住图片）。
        class: "aspect-square h-full w-full object-cover relative z-1",
        onLoadingStatusChange: () => {
          // Image handles visibility internally based on error state
        },
      }),
      ui.AvatarPrimitive.Fallback(
        {
          // absolute inset-0：兜底层脱离 flex 流铺满盒子。留在流里的话它那份
          // h-full w-full 会和图片抢宽度，图片被挤扁。
          class:
            "flex absolute inset-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium",
        },
        children ?? [fallback || (alt ? alt.charAt(0).toUpperCase() : "?")],
      ),
    ],
  );
}
