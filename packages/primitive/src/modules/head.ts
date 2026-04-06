import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";

export function Head1(props: ViewProps, children?: ViewChildren) {
  return View({ ...props, as: "h1" }, children);
}
export function Head2(props: ViewProps, children?: ViewChildren) {
  return View({ ...props, as: "h2" }, children);
}
export function Head3(props: ViewProps, children?: ViewChildren) {
  return View({ ...props, as: "h3" }, children);
}
