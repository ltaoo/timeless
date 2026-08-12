import { View, ViewProps } from "../core";

export function Skeleton(props: ViewProps) {
  return View({
    ...props,
    dataset: {
      skeleton: "",
    },
  });
}
