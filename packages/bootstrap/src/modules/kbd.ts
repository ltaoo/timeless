import { View, ViewChildren, ViewProps, classNames } from "@timeless/timeless";

export function Kbd(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      as: "kbd",
      class: classNames(["kbd", cls]),
    },
    children,
  );
}

export function KbdGroup(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      class: classNames(["kbd-group", cls]),
    },
    children,
  );
}
