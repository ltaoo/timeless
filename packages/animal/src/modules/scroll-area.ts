import { View, ViewChildren, ViewProps, classNames } from "@timeless/timeless";

export function ScrollArea(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      class: classNames(["animal-scroll-area", cls]),
    },
    children,
  );
}
