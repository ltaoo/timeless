import { TimelessElement } from "../primitive/view";

// 创建延迟执行的组件包装器
export function h<P, R extends TimelessElement>(
  component: (props: P, children?: any) => R,
  props: P,
  children: any = [],
): () => R {
  return () => {
    return component(props, children);
  };
}
