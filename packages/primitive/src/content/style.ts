import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";

export interface NativeStyleProps extends Omit<ViewProps, "as"> {}

export function NativeStyle(
  props: NativeStyleProps = {},
  children?: ViewChildren,
) {
  return View({ ...props, as: "style" }, children);
}
