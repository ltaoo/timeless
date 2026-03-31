import { View, ViewProps } from "@/primitive/view";

export function Skeleton(props: ViewProps) {
  return View({
    ...props,
    dataset: {
      skeleton: "",
    },
  });
}
