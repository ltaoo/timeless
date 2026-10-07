import { ui, vm } from "@timeless/timeless";
import { ViewChildren, ViewProps, classNames } from "@timeless/timeless";

/**
 * ScrollView · Lucky
 *
 * 复用 headless 的 ScrollViewPrimitive.Root（负责尺寸/滚动量上报），
 * 只负责挂上 .lucky-scroll-view 的 Lucky 细滚动条（样式见 scroll-view.css，
 * 与 .lucky-scroll-area 同一套 thumb 规则）。滚动行为/触底回调都在 store 上。
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
      class: classNames(["lucky-scroll-view", cls]),
    },
    children,
  );
}
