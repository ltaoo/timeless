import { DerivedRef, Ref, Signal } from "@timeless/reactive";

import { ViewStyleProperties } from "@/style";
import { MountedEvent } from "@/event";

import { TimelessLazyComponent } from "./lazy-view";
import { VNodeView } from "@/vnode/view";

export type ViewPropValue = string | number | boolean | undefined | null;
export type ViewAttributes = Record<string, any>;

export type TimelessNormalComponent = (...args: unknown[]) => TimelessElement;
export type TimelessComponent = TimelessNormalComponent | TimelessLazyComponent;

export interface TimelessElement<T = any, Elm = any> {
  t: string;
  $elm: VNodeView<Elm>;
  /** 描述该元素的状态，用来替代 value */
  state: T;
  children?: (TimelessElement | null)[];
  events?: {
    onMounted?: (e: MountedEvent<VNodeView<Elm>>) => void;
    onClick?: (e: MouseEvent) => void;
    onDoubleClick?: (e: MouseEvent) => void;
    onLongPress?: (e: PointerEvent) => void;
    onPointerDown?: (e: PointerEvent) => void;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
    onChange?: (e: Event) => void;
    onInput?: (e: Event) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    onContextMenu?: (e: MouseEvent) => void;
    onDragStart?: (e: DragEvent) => void;
    onDrag?: (e: DragEvent) => void;
    onDragEnd?: (e: DragEvent) => void;
    onDragEnter?: (e: DragEvent) => void;
    onDragOver?: (e: DragEvent) => void;
    onDragLeave?: (e: DragEvent) => void;
    onDrop?: (e: DragEvent) => void;
    onAnimationEnd?: (e: AnimationEvent) => void;
  };
  // render(): any;
  hydrate?(existingDom: any): any;
  cleanup?: () => void;
  onMounted?(event: MountedEvent): void;
  beforeUnmounted?(): void;
  onUnmounted?(): void;
}

export function isElement(v: any): v is TimelessElement {
  if (v === null || v === undefined) {
    return false;
  }
  if (v.t && v.hasOwnProperty("$elm")) {
    return true;
  }
  return false;
}

export type ViewChildren = (
  | DerivedRef<string | number>
  | Ref<string | number>
  | TimelessElement
  | string
  | number
  | null
)[];
