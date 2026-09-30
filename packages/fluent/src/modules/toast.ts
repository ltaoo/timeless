import { ui, vm } from "@timeless/timeless";
import { classNames, computed } from "@timeless/timeless";
import { View, ViewProps, ViewChildren } from "@timeless/timeless";

/**
 * Toast · Fluent 2
 *
 * 类名：.fl-toast / .fl-toast__header / .fl-toast__body。
 * Fluent 2 特征：--surface-1 底 + 1px --stroke2 + --shadow-16，
 * 左侧 3px 状态色条用 --brand-fill / --destructive / --success。
 *
 * 注意：headless 的 ToastCore 目前没有暴露 state（相关的 getter 全部被注释掉了），
 * 且 ToastPrimitive.Root 会把 children 原样返回。因此这里不读取 store.state，
 * 只负责把内容包进作用域内的 .fl-toast 容器；显隐与堆叠交给调用方。
 */

const VARIANT_CLASSES: Record<string, string> = {
  brand: "fl-toast--brand",
  primary: "fl-toast--brand",
  info: "fl-toast--brand",
  success: "fl-toast--success",
  warning: "fl-toast--warning",
  danger: "fl-toast--danger",
  destructive: "fl-toast--danger",
  neutral: "",
};

export function Toast(
  props: ViewProps & { store: vm.ToastCore; variant?: string },
  children: ViewChildren = [],
) {
  const { store, class: cls, variant = "brand", ...rest } = props;

  return ui.ToastPrimitive.Root({ store }, [
    View(
      {
        ...rest,
        class: classNames([
          "fl-toast",
          VARIANT_CLASSES[variant] ?? "",
          cls,
        ]),
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
