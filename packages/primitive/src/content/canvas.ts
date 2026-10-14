import { View, ViewProps } from "./view";

/** Drawing surface shape. Context creation and rendering belong to the host. */
export function Canvas(props: ViewProps = {}) {
  const view = View(props);
  view.t = "canvas";
  return view;
}
export type Canvas = ReturnType<typeof Canvas>;
