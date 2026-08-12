import { ui } from "@timeless/timeless";
import { ViewProps } from "@timeless/timeless";
import { classNames } from "@timeless/timeless";

export function Skeleton(props: ViewProps) {
  const { class: cls, ...rest } = props;
  return ui.SkeletonPrimitive.Skeleton({
    ...rest,
    class: classNames([
      "animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800",
      cls,
    ]),
  });
}
