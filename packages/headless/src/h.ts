import { TimelessNormalComponent } from "./view";

// 创建延迟执行的组件包装器
export function h<T extends TimelessNormalComponent>(
  component: T,
  props: Parameters<T>[0],
  children?: any,
) {
  return () => {
    return component(props, children);
  };
}
