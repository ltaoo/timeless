import { tp, merge } from "./theme.js";
import { View } from "./view.js";

export function Separator(props: any) {
  const { orientation = "horizontal", theme: t, class: cn, style: st } = props || {};
  return View({ ...merge(tp(t?.root, { orientation }), cn, st) });
}
