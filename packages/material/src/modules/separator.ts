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
      "m3-separator",
      orientation === "vertical"
        ? "m3-separator--vertical"
        : "m3-separator--horizontal",
      cls,
    ]),
  });
}
