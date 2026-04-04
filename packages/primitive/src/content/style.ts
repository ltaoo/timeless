import { View, ViewChildren, ViewProps } from "@/content/view";

export interface NativeStyleProps extends Omit<ViewProps, "as"> {}

export function NativeStyle(
  props: NativeStyleProps = {},
  children?: ViewChildren,
) {
  return View({ ...props, as: "style" }, children);
}
