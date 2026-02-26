import { tp, merge } from "./theme.js";
import { View } from "./view.js";

export function Alert(props: any, children?: any) {
  const { variant = "default", theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ ...rest, ...merge(tp(t?.root, { variant }), cn, st) }, children);
}

export function AlertTitle(props: any, children?: any) {
  const { theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ ...rest, ...merge(tp(t?.title), cn, st) }, children);
}

export function AlertDescription(props: any, children?: any) {
  const { theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ ...rest, ...merge(tp(t?.description), cn, st) }, children);
}
