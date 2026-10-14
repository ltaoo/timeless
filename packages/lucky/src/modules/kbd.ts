import { View, ViewChildren, ViewProps, classNames } from "@timeless/timeless";

export function Kbd(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      class: classNames([
        "tt-content-inline tt-content-code",
        classNames(["lucky-kbd", cls]),
      ]),
    },
    children,
  );
}

export function KbdGroup(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      class: classNames(["lucky-kbd-group", cls]),
    },
    children,
  );
}
