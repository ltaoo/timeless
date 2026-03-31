import { View, ViewChildren, ViewProps } from "@/primitive/view";

export function Label(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      as: "label",
      dataset: {
        label: "",
      },
      ...props,
    },
    children,
  );
}
