import { View } from "./view.js";
import { classnames } from "@timeless/reactive";

export function Head2(props: any, children?: any) {
  const class$ = classnames(["flex"]);
  return View(
    {
      type: "h2",
      class: class$.toString(),
    },
    children,
  );
}
