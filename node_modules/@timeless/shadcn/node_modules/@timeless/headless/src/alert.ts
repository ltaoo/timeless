import { View, ViewChildren, ViewProps } from "./view";

export function Alert(
  props: ViewProps & { variant?: "default" | "destructive" },
  children?: ViewChildren,
) {
  const { variant = "default", ...rest } = props || {};
  return View(
    {
      ...rest,
      // "data-alert": "",
      // "data-variant": variant,
      // role: "alert",
    },
    children,
  );
}

export function AlertTitle(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      // "data-alert-title": "",
    },
    children,
  );
}

export function AlertDescription(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      // "data-alert-description": "",
    },
    children,
  );
}
