import { ui } from "@timeless/timeless";
import { ViewProps } from "@timeless/timeless";

export function Skeleton(props: ViewProps) {
  return ui.SkeletonPrimitive.Skeleton({
    ...props,
    style: {
      "border-radius": "4px",
      background: "var(--weui-BG-0)",
      animation: "weui-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
    },
  });
}
