import { View, ViewProps, ViewChildren } from "../core";

export function Alert(
  props: ViewProps & { variant?: "default" | "destructive" },
  children?: ViewChildren,
) {
  const { variant = "default", ...rest } = props || {};
  return View(
    {
      ...rest,
      dataset: {
        alert: "",
        variant,
      },
      attributes: {
        role: "alert",
      },
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
