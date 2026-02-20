import { tp, merge } from "./theme.js";
import { View } from "../ui/view.js";

export function Badge(props, children) {
  const { variant = "default", theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ ...rest, ...merge(tp(t?.root, { variant }), cn, st) }, children);
}
