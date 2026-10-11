import { Html, View, ViewChildren, ViewProps, classNames } from "@timeless/timeless";

export function Kbd(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return Html.Kbd(
    {
      ...rest,
      class: classNames(["animal-kbd", cls]),
    },
    children,
  );
}

export function KbdGroup(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      class: classNames(["animal-kbd-group", cls]),
    },
    children,
  );
}
