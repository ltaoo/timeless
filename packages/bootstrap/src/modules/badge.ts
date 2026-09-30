import { ui } from "@timeless/timeless";
import {
  ViewChildren,
  ViewProps,
  classNames,
} from "@timeless/timeless";

const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "",
  secondary: "badge-secondary",
  outline: "badge-outline",
  destructive: "badge-destructive",
  danger: "badge-destructive",
  success: "badge-success",
  warning: "badge-warning",
  info: "badge-info",
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
      class: classNames(["badge", VARIANT_CLASSES[variant] || "", cls]),
    },
    children,
  );
}
