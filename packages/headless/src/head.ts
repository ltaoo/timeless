import { View, ViewChildren, ViewProps } from "./view";

export function Head1(props: ViewProps, children?: ViewChildren) {
  return View({ ...props, type: "h1" }, children);
}
export function Head2(props: ViewProps, children?: ViewChildren) {
  return View({ ...props, type: "h2" }, children);
}
export function Head3(props: ViewProps, children?: ViewChildren) {
  return View({ ...props, type: "h3" }, children);
}
