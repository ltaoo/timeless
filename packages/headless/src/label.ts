import { tp, merge } from "./theme";
import { View, ViewChildren, ViewProps } from "./view";

export function Label(
  props: ViewProps & { theme?: any },
  children?: ViewChildren,
) {
  const { theme: t, class: cls, style: st, ...rest } = props || {};
  return View(
    { type: "label", ...rest, ...merge(tp(t?.root), cls, st) },
    children,
  );
}
