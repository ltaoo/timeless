import { View, ViewChildren, ViewProps } from "./view";

export function Label(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      type: "label",
      ...props,
      // "data-label": "",
    },
    children,
  );
}
