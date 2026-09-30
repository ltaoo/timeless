import { ui } from "@timeless/timeless";
import { ViewChildren, ViewProps, classNames } from "@timeless/timeless";

const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "",
  secondary: "fl-badge--secondary",
  outline: "fl-badge--outline",
  destructive: "fl-badge--danger",
  danger: "fl-badge--danger",
  success: "fl-badge--success",
  warning: "fl-badge--warning",
  info: "fl-badge--info",
};

export function Badge(
  props: ViewProps & {
    variant?:
      | "default"
      | "primary"
      | "secondary"
      | "outline"
      | "destructive"
      | "danger"
      | "success"
      | "warning"
      | "info";
  },
  children?: ViewChildren,
) {
  const { variant = "default", class: cls, ...rest } = props;
  return ui.BadgePrimitive.Badge(
    {
      ...rest,
      variant: variant as any,
      class: classNames(["fl-badge", VARIANT_CLASSES[variant] || "", cls]),
    },
    children,
  );
}
