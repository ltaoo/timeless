import { View, ViewProps } from "../primitive/view";

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
