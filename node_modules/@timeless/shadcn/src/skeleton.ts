import { Skeleton as H, ViewProps } from "@timeless/headless";
import { cn } from "@timeless/reactive";

export function Skeleton(props: ViewProps) {
  const { class: cls, ...rest } = props;
  return H({
    ...rest,
    class: cn(["animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800", cls]),
  });
}
