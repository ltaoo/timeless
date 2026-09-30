import { View, ViewChildren, ViewProps, classNames } from "@timeless/timeless";

export function ScrollArea(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      class: classNames(["fl-scroll-area", cls]),
    },
    children,
  );
}
