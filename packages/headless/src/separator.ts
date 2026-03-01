import { tp, merge } from "./theme";
import { View, ViewProps } from "./view";

export function Separator(
  props: ViewProps & {
    orientation: "horizontal" | "vertical";
    theme?: any;
  },
) {
  const {
    orientation = "horizontal",
    theme: t,
    class: cls,
    style: st,
  } = props || {};
  return View({ ...merge(tp(t?.root, { orientation }), cls, st) });
}
