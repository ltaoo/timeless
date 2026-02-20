import { tp, merge } from "./theme.js";
import { View } from "../ui/view.js";

export function Alert(props, children) {
  const { variant = "default", theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ ...rest, ...merge(tp(t?.root, { variant }), cn, st) }, children);
}

export function AlertTitle(props, children) {
  const { theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ ...rest, ...merge(tp(t?.title), cn, st) }, children);
}

export function AlertDescription(props, children) {
  const { theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ ...rest, ...merge(tp(t?.description), cn, st) }, children);
}
