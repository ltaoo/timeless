import { ui } from "@timeless/timeless";
import { ViewChildren, ViewProps, classNames } from "@timeless/timeless";

const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "alert-primary",
  secondary: "alert-secondary",
  success: "alert-success",
  warning: "alert-warning",
  danger: "alert-danger",
  destructive: "alert-danger",
  info: "alert-info",
};

export function Alert(
  props: ViewProps & {
    variant?:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "danger"
      | "destructive"
      | "info";
  },
  children?: ViewChildren,
) {
  const { variant = "default", class: cls, ...rest } = props;
  return ui.AlertPrimitive.Alert(
    {
      ...rest,
      variant: variant as any,
      class: classNames(["alert", VARIANT_CLASSES[variant] || "", cls]),
    },
    children,
  );
}

export function AlertTitle(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.AlertPrimitive.AlertTitle(
    { ...rest, class: classNames(["alert-title", cls]) },
    children,
  );
}

export function AlertDescription(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.AlertPrimitive.AlertDescription(
    { ...rest, class: classNames(["alert-description", cls]) },
    children,
  );
}
