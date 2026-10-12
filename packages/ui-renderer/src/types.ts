import type {
  DerivedRef,
  TimelessElement,
  ViewChildren,
} from "@timeless/timeless";
import type { SlotMap } from "./index";

export type Cleanup = () => void;
export type SlotKind = "single" | "list" | "keyed" | "chain";
export interface SlotDefinition<K extends SlotKind = SlotKind, P = unknown> {
  kind: K;
  props: P;
}

export type SlotName = keyof SlotMap & string;
export type OwnerProps<K extends SlotName> =
  SlotMap[K] extends SlotDefinition<SlotKind, infer P> ? P : never;
export type KindOf<K extends SlotName> =
  SlotMap[K] extends SlotDefinition<infer Kind, unknown> ? Kind : never;
export type Children = { [K in SlotName]?: KindOf<K> };
export interface Observable<T> {
  getSnapshot(): T;
  subscribe(listener: () => void): Cleanup;
}
export interface RenderOptions {
  entryKey?: string | Observable<string>;
}
export interface ComponentProps<K extends SlotName> {
  owner: OwnerProps<K>;
  matched: unknown;
  renderSlot<N extends SlotName>(
    name: N,
    owner: OwnerProps<N>,
    options?: RenderOptions,
  ): TimelessElement;
  observe<T, R>(
    source: Observable<T>,
    selector: (snapshot: T) => R,
  ): DerivedRef<R>;
  onCleanup(cleanup: Cleanup): void;
}
export type SlotComponent<K extends SlotName> = (
  props: ComponentProps<K>,
) => ViewChildren;
export type RegistrationOptions<K extends SlotName> = {
  name: K;
  priority?: number;
  order?: number;
  children?: Children;
} & (SlotMap[K] extends SlotDefinition<"list", unknown>
  ? { id: string }
  : SlotMap[K] extends SlotDefinition<"keyed", unknown>
    ? { key: string }
    : SlotMap[K] extends SlotDefinition<"chain", unknown>
      ? { select(owner: OwnerProps<K>): unknown }
      : {});
export interface RendererHost<C> {
  /** Attach the tree without invoking its lifecycle; return a detach operation. */
  mount(element: TimelessElement, container: C): Cleanup;
}
