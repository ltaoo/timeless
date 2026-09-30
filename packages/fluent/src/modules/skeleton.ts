import { ui } from "@timeless/timeless";
import { ViewProps, classNames } from "@timeless/timeless";

export function Skeleton(props: ViewProps) {
  const { class: cls, ...rest } = props;
  return ui.SkeletonPrimitive.Skeleton({
    ...rest,
    class: classNames(["fl-skeleton", cls]),
  });
}
