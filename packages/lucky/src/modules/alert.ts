import { ui } from "@timeless/timeless";
import { ViewChildren, ViewProps, classNames } from "@timeless/timeless";

const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "lucky-alert--primary",
  secondary: "lucky-alert--secondary",
  success: "lucky-alert--success",
  warning: "lucky-alert--warning",
  danger: "lucky-alert--danger",
  destructive: "lucky-alert--danger",
  info: "lucky-alert--info",
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
      class: classNames(["lucky-alert", VARIANT_CLASSES[variant] || "", cls]),
    },
    children,
  );
}

export function AlertTitle(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.AlertPrimitive.AlertTitle(
    { ...rest, class: classNames(["lucky-alert__title", cls]) },
    children,
  );
}

export function AlertDescription(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.AlertPrimitive.AlertDescription(
    { ...rest, class: classNames(["lucky-alert__description", cls]) },
    children,
  );
}
