import { ui, vm } from "@timeless/timeless";
import { ViewChildren, ViewProps, classNames } from "@timeless/timeless";

/**
 * ScrollView · Material 3
 *
 * 类名：.m3-scroll-view（细滚动条，取自 --outline）。
 * 直接包 ui.ScrollViewPrimitive.Root：滚动位置、到达底部等行为都由 headless 层
 * 通过 ScrollViewCore + provider 完成，这里只负责作用域类名。
 */
export function ScrollView(
  props: ViewProps & { store: vm.ScrollViewCore },
  children: ViewChildren,
) {
  const { store, class: cls, ...rest } = props;

  return ui.ScrollViewPrimitive.Root(
    {
      ...rest,
      store,
      class: classNames(["m3-scroll-view", cls]),
    },
    children,
  );
}
