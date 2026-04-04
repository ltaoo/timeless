import { View, ViewProps } from "@/content/view";

export function Skeleton(props: ViewProps) {
  return View({
    ...props,
    dataset: {
      skeleton: "",
    },
  });
}
