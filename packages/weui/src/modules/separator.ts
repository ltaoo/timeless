import { ViewProps } from "@timeless/timeless";
import { SeparatorPrimitive } from "@timeless/ui-primitive";

export function Separator(
  props: ViewProps & { orientation?: "horizontal" | "vertical" },
) {
  const { orientation = "horizontal", ...rest } = props;
  const style =
    orientation === "vertical"
      ? {
          width: "1px",
          height: "100%",
          background: "var(--weui-SEPARATOR-0)",
          "flex-shrink": "0",
        }
      : {
          height: "1px",
          width: "100%",
          background: "var(--weui-SEPARATOR-0)",
          "flex-shrink": "0",
        };
  return SeparatorPrimitive.Separator({
    ...rest,
    orientation,
    style,
  });
}
