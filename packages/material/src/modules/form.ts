import { vm } from "@timeless/timeless";
import { View, ViewProps, ViewChildren } from "@timeless/timeless";

/**
 * Form · Material 3
 *
 * M3 没有独立的 form 容器组件（表单布局靠 Field / FieldSet 组合）。
 * 这里与 shadcn / bootstrap 版本保持一致，只做一层透传；给根节点加 .m3-form
 * 时会得到一个纵向间距容器。字段级渲染请直接用 Field / FieldSet 系列组件。
 */
export function Form(
  props: ViewProps & {
    store: vm.ObjectFieldCore<any> | vm.ArrayFieldCore<any>;
  },
  children?: ViewChildren,
) {
  return View(props, children);
}
