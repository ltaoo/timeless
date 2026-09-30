import { ui } from "@timeless/timeless";
import { ViewChildren, ViewProps, classNames } from "@timeless/timeless";

const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "",
  secondary: "animal-badge--secondary",
  outline: "animal-badge--outline",
  destructive: "animal-badge--danger",
  danger: "animal-badge--danger",
  success: "animal-badge--success",
  warning: "animal-badge--warning",
  info: "animal-badge--info",
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
      class: classNames(["animal-badge", VARIANT_CLASSES[variant] || "", cls]),
    },
    children,
  );
}
