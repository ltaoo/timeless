import { ui } from "@timeless/timeless";
import { ViewProps, classNames } from "@timeless/timeless";

export function Separator(
  props: ViewProps & { orientation?: "horizontal" | "vertical" },
) {
  const { orientation = "horizontal", class: cls, ...rest } = props;
  return ui.SeparatorPrimitive.Separator({
    ...rest,
    orientation,
    class: classNames([
      "separator",
      orientation === "vertical" ? "separator-vertical" : "separator-horizontal",
      cls,
    ]),
  });
}
