import { ui, vm } from "@timeless/timeless";
import { ViewChildren, type ViewProps } from "@timeless/timeless";
import { classNames } from "@timeless/timeless";

export function ScrollView(
  props: ViewProps & { store: vm.ScrollViewCore },
  children: ViewChildren,
) {
  const { store, class: cls, ...rest } = props;

  return ui.ScrollViewPrimitive.Root(
    {
      ...rest,
      store,
      class: classNames(["scroll-view overflow-y-auto w-full h-full", cls]),
    },
    children,
  );
}
