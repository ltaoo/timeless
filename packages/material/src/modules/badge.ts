import { ui } from "@timeless/timeless";
import { ViewChildren, ViewProps, classNames } from "@timeless/timeless";

/**
 * Material 3 徽标：pill 形，默认 --primary-container 填充。
 * 各变体分别落到 M3 的 container 色对（primary / secondary / tertiary / error…）。
 */
const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "",
  secondary: "m3-badge--secondary",
  tertiary: "m3-badge--tertiary",
  outline: "m3-badge--outline",
  destructive: "m3-badge--destructive",
  danger: "m3-badge--destructive",
  error: "m3-badge--destructive",
  success: "m3-badge--success",
  warning: "m3-badge--warning",
  info: "m3-badge--info",
};

export function Badge(
  props: ViewProps & {
    variant?:
      | "default"
      | "primary"
      | "secondary"
      | "tertiary"
      | "outline"
      | "destructive"
      | "danger"
      | "error"
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
      class: classNames(["m3-badge", VARIANT_CLASSES[variant] || "", cls]),
    },
    children,
  );
}
