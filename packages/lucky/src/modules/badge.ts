import { ui } from "@timeless/timeless";
import { ViewChildren, ViewProps, classNames } from "@timeless/timeless";

const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "",
  secondary: "lucky-badge--secondary",
  outline: "lucky-badge--outline",
  destructive: "lucky-badge--danger",
  danger: "lucky-badge--danger",
  success: "lucky-badge--success",
  warning: "lucky-badge--warning",
  info: "lucky-badge--info",
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
      class: classNames(["lucky-badge", VARIANT_CLASSES[variant] || "", cls]),
    },
    children,
  );
}
