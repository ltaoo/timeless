import { vm } from "@timeless/timeless";
import { View, ViewProps, ViewChildren, classNames } from "@timeless/timeless";

/**
 * Form · Animal Island
 *
 * Animal Island 没有独立的 form 容器语义，这里只提供一层纵向布局容器（.animal-form），
 * 字段级渲染请直接用 Field / FieldSet 系列组件。
 */
export function Form(
  props: ViewProps & {
    store: vm.ObjectFieldCore<any> | vm.ArrayFieldCore<any>;
  },
  children?: ViewChildren,
) {
  const { class: cls, ...rest } = props;
  return View({ ...rest, class: classNames(["animal-form", cls]) }, children);
}
