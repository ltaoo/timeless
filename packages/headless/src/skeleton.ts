import { tp, merge } from "./theme";
import { View, ViewProps } from "./view";

export function Skeleton(props: ViewProps & { theme?: any }) {
  const { theme: t, class: cls, style: st, ...rest } = props || {};
  return View({ ...rest, ...merge(tp(t?.root), cls, st) });
}
