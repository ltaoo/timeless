import type { ChildDescriptor, ComponentType, ElementDescriptor } from "./descriptor";
import { ELEMENT_TYPE } from "./descriptor";

export function h(
  type: ComponentType,
  props?: Record<string, any> | null,
  children?: ChildDescriptor[],
): ElementDescriptor {
  const p = props ?? {};
  return {
    $$typeof: ELEMENT_TYPE,
    type,
    props: p,
    children: children ?? [],
    key: p.key,
  };
}
