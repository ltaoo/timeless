import type { VNode, VNodeKey } from "./types";

export const ELEMENT_TYPE = Symbol.for("timeless.element");

export type ComponentFn<P extends Record<string, any> = Record<string, any>> = (
  props: P,
  children: ChildDescriptor[],
) => VNode;

export type ComponentType = ComponentFn | string;

export interface ElementDescriptor {
  $$typeof: typeof ELEMENT_TYPE;
  type: ComponentType;
  props: Record<string, any>;
  children: ChildDescriptor[];
  key?: VNodeKey;
}

export type ChildDescriptor = ElementDescriptor | string | number | null;

export function isDescriptor(v: unknown): v is ElementDescriptor {
  return (
    v !== null &&
    typeof v === "object" &&
    (v as any).$$typeof === ELEMENT_TYPE
  );
}
