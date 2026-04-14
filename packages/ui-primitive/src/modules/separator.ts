import { View, ViewProps } from "@timeless/timeless";

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
