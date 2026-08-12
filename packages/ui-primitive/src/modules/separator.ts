import { View, ViewProps } from "../core";

export function Separator(
  props: ViewProps & { orientation?: "horizontal" | "vertical" },
) {
  const { orientation = "horizontal", ...rest } = props || {};
  return View({
    ...rest,
    dataset: {
      separator: "",
      orientation,
    },
    attributes: {
      role: "separator",
    },
  });
}
