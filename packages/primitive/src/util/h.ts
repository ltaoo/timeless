import { TimelessElement, ViewChildren } from "@/content/type";

// 创建延迟执行的组件包装器
export function h<P, R extends TimelessElement>(
  component: (props: P, children?: any) => R,
  props: P,
  children?: ViewChildren,
): () => R {
  return () => {
    // 每次调用时复制 children 数组，避免被 normalizeChildren 修改原数组
    // 这确保组件销毁后重新创建时，能获得新的子组件实例
    const childrenCopy = Array.isArray(children) ? [...children] : children;
    return component(props, childrenCopy);
  };
}
