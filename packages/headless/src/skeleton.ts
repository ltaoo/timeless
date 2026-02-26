import { tp, merge } from "./theme.js";
import { View } from "./view.js";

export function Skeleton(props: any) {
  const { theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ ...rest, ...merge(tp(t?.root), cn, st) });
}
