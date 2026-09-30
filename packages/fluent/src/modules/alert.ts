import { ui } from "@timeless/timeless";
import { ViewChildren, ViewProps, classNames } from "@timeless/timeless";

const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "fl-alert--primary",
  secondary: "fl-alert--secondary",
  success: "fl-alert--success",
  warning: "fl-alert--warning",
  danger: "fl-alert--danger",
  destructive: "fl-alert--danger",
  info: "fl-alert--info",
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
      class: classNames(["fl-alert", VARIANT_CLASSES[variant] || "", cls]),
    },
    children,
  );
}

export function AlertTitle(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.AlertPrimitive.AlertTitle(
    { ...rest, class: classNames(["fl-alert__title", cls]) },
    children,
  );
}

export function AlertDescription(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.AlertPrimitive.AlertDescription(
    { ...rest, class: classNames(["fl-alert__description", cls]) },
    children,
  );
}
