import { TimelessElement, VNodeView } from "@timeless/timeless";
import { NativeView } from "./view";

export function NativeForm(props: {
  build: (elm: TimelessElement) => VNodeView;
  elm: TimelessElement;
}) {
  const view = NativeView(props);
  view.get$elm().type = "form";
  return { ...view, t: "form", isDocumentFragment: () => false };
}
