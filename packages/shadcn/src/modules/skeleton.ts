import { ViewProps } from "@timeless/timeless";
import { classNames } from "@timeless/timeless";
import { SkeletonPrimitive } from "@timeless/ui-primitive";

export function Skeleton(props: ViewProps) {
  const { class: cls, ...rest } = props;
  return SkeletonPrimitive.Skeleton({
    ...rest,
    class: classNames([
      "animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800",
      cls,
    ]),
  });
}
