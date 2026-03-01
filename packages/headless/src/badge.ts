import { tp, merge } from "./theme";
import { View, ViewProps, ViewChildren } from "./view";

export function Badge(props: any, children?: ViewChildren) {
  const {
    variant = "default",
    theme: t,
    class: cls,
    style: st,
    ...rest
  } = props || {};
  return View(
    { ...rest, ...merge(tp(t?.root, { variant }), cls, st) },
    children,
  );
}
