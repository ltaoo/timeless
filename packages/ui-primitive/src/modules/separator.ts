import { View, ViewProps } from "../core";

export function Separator(
  props: ViewProps & { orientation?: "horizontal" | "vertical" },
) {
  const { orientation = "horizontal", ...rest } = props || {};
  return View({
    ...rest,
    dataset: {
      ...rest.dataset,
      separator: "",
      orientation,
    },
    attributes: {
      n: "separator",
      ...rest.attributes,
      role: "separator",
      "aria-orientation": orientation,
    },
  });
}
