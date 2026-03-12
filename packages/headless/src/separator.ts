import { View, ViewProps } from "./view";

export function Separator(
  props: ViewProps & { orientation?: "horizontal" | "vertical" },
) {
  const { orientation = "horizontal", ...rest } = props || {};
  return View({
    ...rest,
    // "data-separator": "",
    // "data-orientation": orientation,
    // role: "separator",
  });
}
