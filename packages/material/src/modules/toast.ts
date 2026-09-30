import { ui, vm } from "@timeless/timeless";
import { classNames } from "@timeless/timeless";
import { View, ViewChildren, ViewProps } from "@timeless/timeless";

/**
 * Toast · Material 3
 *
 * 类名（`m3-toast` 命名空间）：.m3-toast / .m3-toast__header / .m3-toast__body。
 * M3 配色：--surface-container-high + --elevation-3。
 *
 * 注意：headless 的 ToastCore 目前没有暴露 state（相关的 getter 全部被注释掉了），
 * 且 ToastPrimitive.Root 会把 children 原样返回。因此这里不读取 store.state，
 * 只负责把内容包进作用域内的 .m3-toast 容器；显隐与堆叠交给调用方。
 */
export function Toast(
  props: ViewProps & { store: vm.ToastCore },
  children: ViewChildren = [],
) {
  const { store, class: cls, ...rest } = props;

  return ui.ToastPrimitive.Root({ store }, [
    View(
      {
        ...rest,
        class: classNames(["m3-toast", cls]),
        attributes: {
          role: "alert",
          "aria-live": "assertive",
          "aria-atomic": "true",
        },
      },
      children,
    ),
  ]);
}
