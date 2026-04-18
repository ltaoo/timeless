/**
 * Type definitions for Timeless content components.
 *
 * This module exports:
 * - TimelessElement: Core component interface
 * - TimelessComponent: Component factory type
 * - ViewChildren: Array of possible child types
 * - Helper functions: isElement type guard
 *
 * These types form the foundation of the Timeless component system.
 */
import { DerivedRef, Ref } from "@timeless/reactive";

import { VNodeView } from "@/vnode/view";
import { MountedEvent } from "@/event";

import { TimelessLazyComponent } from "./lazy-view";
import { BoxState } from "./box";

/** Possible prop values */
export type ViewPropValue = string | number | boolean | undefined | null;

/** HTML attributes record */
export type ViewAttributes = Record<string, any>;

/** Standard synchronous component function */
export type TimelessNormalComponent = (...args: unknown[]) => TimelessElement;

/** Component - can be sync or lazy (async import) */
export type TimelessComponent = TimelessNormalComponent | TimelessLazyComponent;

/**
 * TimelessElement - Core interface for all Timeless components.
 *
 * Every component returns this structure containing:
 * - t: Type identifier (e.g., "view", "text", "box")
 * - $elm: Reference to the actual DOM/VM element
 * - state: Component-specific state
 * - children: Child elements
 * - onMounted: Lifecycle called when mounted
 * - onUnmounted: Lifecycle called when unmounted
 *
 * @example
 * ```typescript
 * interface TimelessElement<T = any, Elm = any> {
 *   t: string;
 *   $elm: VNodeView<Elm>;
 *   state: T;
 *   children?: TimelessElement[];
 *   onMounted(event: MountedEvent): void;
 *   onUnmounted(): void;
 * }
 * ```
 */
export interface TimelessElement<T = any, Elm = any> {
  t: string;
  $elm: VNodeView<Elm>;
  /** 描述该元素的状态，用来替代 value */
  state: T & BoxState;
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
  a11y?: VNodeA11y;
  // hydrate?(existingDom: any): any;
  // cleanup?: () => void;
  onMounted(event: MountedEvent): void;
  beforeUnmounted?(): void;
  onUnmounted(): void;
}

export interface VNodeA11y {
  label?: string;
  hint?: string;
  role?: string;
  hidden?: boolean;
  value?: string;
  live?: "polite" | "assertive";
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

type ViewChild =
  | number
  | string
  | Ref<string | number>
  | DerivedRef<string | number>
  | TimelessElement
  | null;

export type ViewChildrenArray = ViewChild[];

/** Children can be an eager array or a lazy callback returning one */
export type ViewChildren =
  | ViewChild
  | ViewChildrenArray
  | (() => ViewChildrenArray | ViewChild);

/** Resolve ViewChildren to a concrete array */
export function resolve_children(
  children?: ViewChildren,
): ViewChildrenArray | undefined {
  if (typeof children === "function") {
    const r = children();
    if (!Array.isArray(r)) {
      return [r];
    }
    return r;
  }
  if (!Array.isArray(children)) {
    return [children as ViewChild];
  }
  return children;
}
