import { tp, merge } from "./theme.js";
import { View } from "./view.js";

export function Label(props: any, children?: any) {
  const { theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ type: "label", ...rest, ...merge(tp(t?.root), cn, st) }, children);
}
