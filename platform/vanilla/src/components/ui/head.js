import { View } from "./view.js";
import { classnames } from "./core.js";

export function Head2(props, children) {
  const class$ = classnames("flex");
  return View(
    {
      type: "h2",
      class: class$.toString(),
    },
    children,
  );
}
