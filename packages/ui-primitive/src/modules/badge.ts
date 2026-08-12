import { View, ViewProps, ViewChildren } from "../core";

export function Badge(
  props: ViewProps & {
    variant?: "default" | "secondary" | "outline" | "destructive";
  },
  children?: ViewChildren,
) {
  const { variant = "default", ...rest } = props || {};
  return View(
    {
      ...rest,
      dataset: {
        badge: "",
        variant: variant,
      },
    },
    children,
  );
}
