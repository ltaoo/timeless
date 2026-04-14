import { View, ViewProps } from "@timeless/timeless";

export function Skeleton(props: ViewProps) {
  return View({
    ...props,
    dataset: {
      skeleton: "",
    },
  });
}
