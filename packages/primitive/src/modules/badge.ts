import { View, ViewProps, ViewChildren } from "@/primitive/view";

export function Badge(
  props: ViewProps & { variant?: "default" | "secondary" | "outline" | "destructive" },
  children?: ViewChildren,
) {
  const { variant = "default", ...rest } = props || {};
  return View(
    {
      ...rest,
      // "data-badge": "",
      // "data-variant": variant,
    },
    children,
  );
}
