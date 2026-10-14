import { View, ViewProps, ViewChildren } from "../core";

export function Head1(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      attributes: { ...props.attributes, role: "heading", "aria-level": 1 },
    },
    children,
  );
}
export function Head2(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      attributes: { ...props.attributes, role: "heading", "aria-level": 2 },
    },
    children,
  );
}
export function Head3(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      attributes: { ...props.attributes, role: "heading", "aria-level": 3 },
    },
    children,
  );
}
