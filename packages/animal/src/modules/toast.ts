import { ui, vm } from "@timeless/timeless";
import { classNames, computed } from "@timeless/timeless";
import { View, ViewProps, ViewChildren } from "@timeless/timeless";

/**
 * Toast · Animal Island
 *
 * 类名：.animal-toast / .animal-toast__header / .animal-toast__body。
 * Animal Island 特征：羊皮纸底（--card）+ 2px --border + --shadow-lg，
 * 左侧 4px 状态色条用 --primary / --destructive / --success / --warning。
 *
 * 注意：headless 的 ToastCore 目前没有暴露 state（相关的 getter 全部被注释掉了），
 * 且 ToastPrimitive.Root 会把 children 原样返回。因此这里不读取 store.state，
 * 只负责把内容包进作用域内的 .animal-toast 容器；显隐与堆叠交给调用方。
 */

const VARIANT_CLASSES: Record<string, string> = {
  brand: "animal-toast--brand",
  primary: "animal-toast--brand",
  info: "animal-toast--brand",
  success: "animal-toast--success",
  warning: "animal-toast--warning",
  danger: "animal-toast--danger",
  destructive: "animal-toast--danger",
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
          "animal-toast",
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
