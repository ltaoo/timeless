import { tp, merge } from "./theme";
import { View, ViewChildren, ViewProps } from "./view";

export function Alert(
  props: ViewProps & { variant?: "default"; theme?: any },
  children?: ViewChildren,
) {
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

export function AlertTitle(props: any, children?: any) {
  const { theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ ...rest, ...merge(tp(t?.title), cn, st) }, children);
}

export function AlertDescription(props: any, children?: any) {
  const { theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ ...rest, ...merge(tp(t?.description), cn, st) }, children);
}
