import { SkeletonPrimitive, ViewProps } from "@timeless/primitive";
import { cn } from "@timeless/primitive";

export function Skeleton(props: ViewProps) {
  const { class: cls, ...rest } = props;
  return SkeletonPrimitive.Skeleton({
    ...rest,
    class: cn(["animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800", cls]),
  });
}
