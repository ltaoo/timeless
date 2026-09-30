import { ui } from "@timeless/timeless";
import { ViewChildren, ViewProps, classNames } from "@timeless/timeless";

/**
 * Material 3 提示条：用 *-container 色对填充（12px 圆角），
 * 不描边；图标为可选的绝对定位子元素。
 */
const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "m3-alert--primary",
  secondary: "m3-alert--secondary",
  tertiary: "m3-alert--tertiary",
  success: "m3-alert--success",
  warning: "m3-alert--warning",
  danger: "m3-alert--danger",
  destructive: "m3-alert--danger",
  error: "m3-alert--danger",
  info: "m3-alert--info",
};

export function Alert(
  props: ViewProps & {
    variant?:
      | "default"
      | "primary"
      | "secondary"
      | "tertiary"
      | "success"
      | "warning"
      | "danger"
      | "destructive"
      | "error"
      | "info";
  },
  children?: ViewChildren,
) {
  const { variant = "default", class: cls, ...rest } = props;
  return ui.AlertPrimitive.Alert(
    {
      ...rest,
      variant: variant as any,
      class: classNames(["m3-alert", VARIANT_CLASSES[variant] || "", cls]),
    },
    children,
  );
}

export function AlertTitle(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.AlertPrimitive.AlertTitle(
    { ...rest, class: classNames(["m3-alert__title", cls]) },
    children,
  );
}

export function AlertDescription(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.AlertPrimitive.AlertDescription(
    { ...rest, class: classNames(["m3-alert__description", cls]) },
    children,
  );
}
