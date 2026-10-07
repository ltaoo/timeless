import { ui, vm } from "@timeless/timeless";
import { classNames, computed } from "@timeless/timeless";
import { View, ViewProps, ViewChildren } from "@timeless/timeless";

/**
 * Toast · Lucky
 *
 * 类名：.lucky-toast / .lucky-toast__header / .lucky-toast__body。
 * Lucky 特征：--surface-1 底 + 1px --stroke2 + --shadow-16，
 * 左侧 3px 状态色条用 --brand-fill / --destructive / --success。
 *
 * 注意：headless 的 ToastCore 目前没有暴露 state（相关的 getter 全部被注释掉了），
 * 且 ToastPrimitive.Root 会把 children 原样返回。因此这里不读取 store.state，
 * 只负责把内容包进作用域内的 .lucky-toast 容器；显隐与堆叠交给调用方。
 */

const VARIANT_CLASSES: Record<string, string> = {
  brand: "lucky-toast--brand",
  primary: "lucky-toast--brand",
  info: "lucky-toast--brand",
  success: "lucky-toast--success",
  warning: "lucky-toast--warning",
  danger: "lucky-toast--danger",
  destructive: "lucky-toast--danger",
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
          "lucky-toast",
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
