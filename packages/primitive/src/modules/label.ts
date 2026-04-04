import { View, ViewChildren, ViewProps } from "@/content/view";

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
