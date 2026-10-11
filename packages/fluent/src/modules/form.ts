import { vm } from "@timeless/timeless";
import { Form as NativeForm, FormProps, View, ViewProps, ViewChildren, classNames } from "@timeless/timeless";

/**
 * Form · Fluent 2
 *
 * Fluent 2 没有独立的 form 容器语义，这里只提供一层纵向布局容器（.fl-form），
 * 字段级渲染请直接用 Field / FieldSet 系列组件。
 */
export function Form(
  props: FormProps & {
    store?: vm.ObjectFieldCore<any> | vm.ArrayFieldCore<any>;
  },
  children?: ViewChildren,
): ReturnType<typeof NativeForm> {
  const { class: cls, ...rest } = props;
  return NativeForm({ ...rest, class: classNames(["fl-form", cls]) }, children);
}
