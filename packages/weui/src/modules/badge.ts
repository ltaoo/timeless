import { ui } from "@timeless/timeless";
import { ViewProps, ViewChildren } from "@timeless/timeless";

const VARIANTS = {
  default: { background: "var(--weui-BRAND)", color: "#fff" },
  secondary: { background: "var(--weui-FG-5)", color: "var(--weui-FG-0)" },
  outline: {
    background: "transparent",
    border: "1px solid var(--weui-SEPARATOR-1)",
    color: "var(--weui-FG-0)",
  },
  destructive: { background: "var(--weui-RED)", color: "#fff" },
};

const BASE_STYLE = {
  display: "inline-flex",
  "align-items": "center",
  "border-radius": "100px",
  padding: "2px 8px",
  "font-size": "var(--weui-FONT-SIZE-XS)",
  "font-weight": "500",
  "white-space": "nowrap",
};

export function Badge(
  props: ViewProps & {
    variant?: "default" | "secondary" | "outline" | "destructive";
  },
  children?: ViewChildren,
) {
  const { variant = "default", ...rest } = props;
  return ui.BadgePrimitive.Badge(
    {
      ...rest,
      variant,
      style: { ...BASE_STYLE, ...(VARIANTS[variant] || VARIANTS.default) },
    },
    children,
  );
}
