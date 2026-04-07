import { Signal } from "@timeless/reactive";

import { ViewStyleProperties } from "@/style";
import { MountedEvent } from "@/event";

import { TimelessLazyComponent } from "./lazy-view";

export type ViewPropValue = string | number | boolean | undefined | null;
export type MaybeSignal<T = any> = T | Signal<T>;
export type ViewAttributes = Record<string, MaybeSignal>;

export type TimelessNormalComponent = (...args: unknown[]) => TimelessElement;
export type TimelessComponent = TimelessNormalComponent | TimelessLazyComponent;

export interface TimelessElement<T = any> {
  t: string;
  $elm: any;
  children?: TimelessElement[];
  props?: {
    styleSets?: MaybeSignal<string[]>;
    style?: ViewStyleProperties;
  };
  value?: T;
  events?: {
    onClick?: (e: MouseEvent) => void;
    onDoubleClick?: (e: MouseEvent) => void;
    onLongPress?: (e: PointerEvent) => void;
    onPointerDown?: (e: PointerEvent) => void;
    onFocus?: (e: FocusEvent) => void;
    onBlur?: (e: FocusEvent) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    onContextMenu?: (e: MouseEvent) => void;
    onMouseEnter?: (e: MouseEvent) => void;
    onMouseLeave?: (e: MouseEvent) => void;
    onDragStart?: (e: DragEvent) => void;
    onDrag?: (e: DragEvent) => void;
    onDragEnd?: (e: DragEvent) => void;
    onDragEnter?: (e: DragEvent) => void;
    onDragOver?: (e: DragEvent) => void;
    onDragLeave?: (e: DragEvent) => void;
    onDrop?: (e: DragEvent) => void;
    onAnimationEnd?: (e: AnimationEvent) => void;
  };
  render(): any;
  hydrate?(existingDom: any): any;
  cleanup?: () => void;
  onMounted?(event: MountedEvent): void;
  beforeUnmounted?(): void;
  onUnmounted?(): void;
}

export function isElement(v: unknown): v is TimelessElement {
  if (v === null || v === undefined) {
    return false;
  }
  // @ts-ignore
  if (v.t && v.hasOwnProperty("$elm")) {
    return true;
  }
  return false;
}

export type ViewChildren = (
  | TimelessElement
  | TimelessElement[]
  | (() => TimelessElement)
  | string
  | number
  | MaybeSignal<string | number>
  | null
)[];
