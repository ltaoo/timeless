import { tp, merge } from "./theme.js";
import { View } from "../ui/view.js";

export function Label(props, children) {
  const { theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ type: "label", ...rest, ...merge(tp(t?.root), cn, st) }, children);
}
