import { ViewChildren, ViewProps, View } from "@timeless/timeless";
import { ToastPrimitive } from "@timeless/ui-primitive";
import { ToastCore } from "@timeless/inner-vm";

export function Toast(
  props: ViewProps & { store: ToastCore },
  children: ViewChildren = [],
) {
  const { store } = props;

  return ToastPrimitive.Root({ store }, [View({}, children)]);
}
