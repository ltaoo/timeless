import { ui, vm } from "@timeless/timeless";
import { classNames, ViewChildren, ViewProps } from "@timeless/timeless";

/**
 * ScrollView · Bootstrap 5.3
 *
 * 直接用 ScrollViewPrimitive.Root（无需订阅 store 做 class），只补一层
 * .scroll-view 的细滚动条与滚动行为，风格与 .scroll-area 保持一致。
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
      class: classNames(["scroll-view", cls]),
    },
    children,
  );
}
