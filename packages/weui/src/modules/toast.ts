import { ui, vm } from "@timeless/timeless";
import { ViewChildren, ViewProps, View } from "@timeless/timeless";

export function Toast(
  props: ViewProps & { store: vm.ToastCore },
  children: ViewChildren = [],
) {
  const { store } = props;

  return ui.ToastPrimitive.Root({ store }, [View({}, children)]);
}
