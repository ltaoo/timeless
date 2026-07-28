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
import { DerivedRef, Ref } from "@timeless/inner-reactive";

import { VNodeView } from "@/vnode/view";
import { MountedEvent } from "@/event";

import { TimelessLazyComponent } from "./lazy-view";
import { BoxEvents, BoxState } from "./box";

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
 * - destroy: Permanent teardown — VNode is being destroyed
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
  svgType?: string;
  $elm: VNodeView<Elm>;
  state: T & BoxState;
  children?: (TimelessElement | null)[];
  events?: BoxEvents;
  a11y?: VNodeA11y;
  onMounted(event: MountedEvent): void;
  beforeUnmounted?(): void;
  onUnmounted(): void;
  /** Permanent teardown — VNode is being destroyed, not just unmounted */
  destroy?(): void;
}

/** Permanently destroy an element, falling back to onUnmounted if no destroy */
export function destroyElement(
  el: TimelessElement | null | undefined,
): void {
  if (!el) return;
  if (typeof el.destroy === "function") {
    el.destroy();
  } else if (typeof el.onUnmounted === "function") {
    el.onUnmounted();
  }
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
