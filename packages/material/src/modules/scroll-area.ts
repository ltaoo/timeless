import { View, ViewChildren, ViewProps, classNames } from "@timeless/timeless";

export function ScrollArea(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      class: classNames(["m3-scroll-area", cls]),
    },
    children,
  );
}
