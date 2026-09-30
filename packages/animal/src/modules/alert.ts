import { ui } from "@timeless/timeless";
import { ViewChildren, ViewProps, classNames } from "@timeless/timeless";

const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "animal-alert--primary",
  secondary: "animal-alert--secondary",
  success: "animal-alert--success",
  warning: "animal-alert--warning",
  danger: "animal-alert--danger",
  destructive: "animal-alert--danger",
  info: "animal-alert--info",
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
      class: classNames(["animal-alert", VARIANT_CLASSES[variant] || "", cls]),
    },
    children,
  );
}

export function AlertTitle(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.AlertPrimitive.AlertTitle(
    { ...rest, class: classNames(["animal-alert__title", cls]) },
    children,
  );
}

export function AlertDescription(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.AlertPrimitive.AlertDescription(
    { ...rest, class: classNames(["animal-alert__description", cls]) },
    children,
  );
}
