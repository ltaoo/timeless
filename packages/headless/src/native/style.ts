import { View, ViewChildren, ViewProps } from "@/primitive/view";

export interface NativeStyleProps extends Omit<ViewProps, "as"> {}

export function NativeStyle(
  props: NativeStyleProps = {},
  children?: ViewChildren | ViewChildren[number],
) {
  return View({ ...props, as: "style" }, children);
}
