import { SkeletonPrimitive, ViewProps } from "@timeless/timeless";
import { cn } from "@timeless/reactive";

export function Skeleton(props: ViewProps) {
  const { class: cls, ...rest } = props;
  return SkeletonPrimitive.Skeleton({
    ...rest,
    class: cn(["animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800", cls]),
  });
}
