import { vm } from "@timeless/timeless";
import { View, ViewProps, ViewChildren } from "@timeless/timeless";

/**
 * Form · Bootstrap 5.3
 *
 * Bootstrap 没有独立的 form 容器样式（表单布局靠 .row / .mb-3 / .form-control
 * 等组合）。这里与 shadcn 版本保持一致，只做一层透传；字段级的渲染请直接用
 * Field / FieldSet 系列组件。
 */
export function Form(
  props: ViewProps & {
    store: vm.ObjectFieldCore<any> | vm.ArrayFieldCore<any>;
  },
  children?: ViewChildren,
) {
  return View(props, children);
}
