import { Html, View, ViewProps, ViewChildren } from "../core";

export function Head1(props: ViewProps, children?: ViewChildren) {
  return Html.H1({ ...props }, children);
}
export function Head2(props: ViewProps, children?: ViewChildren) {
  return Html.H2({ ...props }, children);
}
export function Head3(props: ViewProps, children?: ViewChildren) {
  return Html.H3({ ...props }, children);
}
