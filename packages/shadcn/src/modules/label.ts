import { ViewProps, ViewChildren, View } from "@timeless/primitive";
import { cn } from "@timeless/primitive";

export function Label(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      as: "label",
      class: cn([
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        cls,
      ]),
    },
    children,
  );
}
