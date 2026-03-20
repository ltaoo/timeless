import { View, ViewProps } from "./view";

export function Skeleton(props: ViewProps) {
  return View({
    ...props,
    // "data-skeleton": "",
  });
}
