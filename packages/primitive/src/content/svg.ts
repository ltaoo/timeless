/**
 * SVG - Factory for creating SVG element components.
 *
 * This module provides constructors for all SVG elements:
 * - Container elements: SVG, G, Defs, Symbol, Use
 * - Shapes: Circle, Rect, Line, Polyline, Polygon, Ellipse, Path
 * - Gradients: LinearGradient, RadialGradient
 * - Filters: Stop, Mask, ClipPath
 * - Text: Text
 *
 * Each returns a TimelessElement representing that SVG type.
 *
 * @example
 * ```tsx
 * <SVG viewBox="0 0 100 100">
 *   <Circle cx={50} cy={50} r={40} fill="blue" />
 * </SVG>
 * ```
 */
import { DerivedRef, Ref } from "@timeless/inner-reactive";

import { isElement } from "@/content/type";
import { ViewStyle, ClassNameRef } from "@/style/index";
import { MountedEvent } from "@/event/index";
import { VNodeView } from "@/vnode/view";

import { Box } from "./box";

/** Type for attribute values - supports static or reactive values */
type AttrValue =
  | string
  | number
  | DerivedRef<string | number | boolean | undefined>
  | Ref<string | number | boolean | undefined>;

/** Props shared by all SVG elements (lifecycle, events, style, class) */
interface SVGBaseProps {
  style?: ViewStyle;
  class?: string | DerivedRef<string> | Ref<string> | ClassNameRef;
  dataset?: Record<string, AttrValue>;
  attributes?: Record<string, AttrValue>;
  id?: AttrValue;
  tabindex?: AttrValue;
  role?: string;
  "aria-label"?: string;
  "aria-hidden"?: "true" | "false";
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  onMounted?(event: MountedEvent<VNodeView>): void | (() => void);
  beforeUnmounted?(): void;
  onUnmounted?(): void;
  onClick?(e: MouseEvent): void;
  onPointerDown?(e: PointerEvent): void;
  onPointerUp?(e: PointerEvent): void;
  onPointerMove?(e: PointerEvent): void;
  onMouseEnter?(e: MouseEvent): void;
  onMouseLeave?(e: MouseEvent): void;
  onFocus?(e: FocusEvent): void;
  onBlur?(e: FocusEvent): void;
}

/** Common SVG presentation attributes */
interface SVGPresentationAttrs {
  fill?: AttrValue;
  "fill-opacity"?: AttrValue;
  "fill-rule"?: AttrValue;
  stroke?: AttrValue;
  "stroke-width"?: AttrValue;
  "stroke-opacity"?: AttrValue;
  "stroke-linecap"?: AttrValue;
  "stroke-linejoin"?: AttrValue;
  "stroke-dasharray"?: AttrValue;
  "stroke-dashoffset"?: AttrValue;
  opacity?: AttrValue;
  transform?: AttrValue;
  "clip-path"?: AttrValue;
  "clip-rule"?: AttrValue;
  mask?: AttrValue;
  filter?: AttrValue;
  visibility?: AttrValue;
  display?: AttrValue;
  "pointer-events"?: AttrValue;
  cursor?: AttrValue;
}

const SVG_NON_ATTRIBUTE_PROPS = new Set([
  "style",
  "class",
  "dataset",
  "attributes",
  "onMounted",
  "beforeUnmounted",
  "onUnmounted",
]);

/**
 * SVG props are DOM attributes by default. Keep component-only props out of the
 * attribute bag and let Box handle class, style, dataset, events and reactive
 * subscriptions in the same way as other primitives.
 */
function createSVGBox<T>(props: SVGBaseProps, extraState: T) {
  const attributes: Record<string, AttrValue> = {};
  const explicitAttrs = props.attributes;

  if (explicitAttrs) {
    Object.keys(explicitAttrs).forEach((k) => {
      attributes[k] = explicitAttrs[k];
    });
  }

  for (const [key, value] of Object.entries(props)) {
    if (
      SVG_NON_ATTRIBUTE_PROPS.has(key) ||
      (key.startsWith("on") && typeof value === "function")
    ) {
      continue;
    }
    attributes[key] = value as AttrValue;
  }

  return Box({ ...props, attributes }, extraState);
}

export interface SVGProps extends SVGBaseProps, SVGPresentationAttrs {
  viewBox?: AttrValue;
  xmlns?: string;
  width?: AttrValue;
  height?: AttrValue;
  x?: AttrValue;
  y?: AttrValue;
  preserveAspectRatio?: AttrValue;
  overflow?: AttrValue;
  color?: AttrValue;
}

export function SVG(props: SVGProps = {}, children?: any) {
  let $elm: any | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-svg",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface GProps extends SVGBaseProps, SVGPresentationAttrs {}

export function G(props: GProps = {}, children?: any) {
  let $elm: SVGGElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-g",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface CircleProps extends SVGBaseProps, SVGPresentationAttrs {
  cx?: AttrValue;
  cy?: AttrValue;
  r?: AttrValue;
}

export function Circle(props: CircleProps = {}, children?: any) {
  let $elm: SVGCircleElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-circle",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface RectProps extends SVGBaseProps, SVGPresentationAttrs {
  x?: AttrValue;
  y?: AttrValue;
  width?: AttrValue;
  height?: AttrValue;
  rx?: AttrValue;
  ry?: AttrValue;
}

export function Rect(props: RectProps = {}, children?: any) {
  let $elm: SVGRectElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-rect",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface PathProps extends SVGBaseProps, SVGPresentationAttrs {
  d?: string | DerivedRef<string> | Ref<string>;
  pathLength?: AttrValue;
}

export function Path(props: PathProps = {}, children?: any) {
  let $elm: any = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-path",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface LineProps extends SVGBaseProps, SVGPresentationAttrs {
  x1?: AttrValue;
  y1?: AttrValue;
  x2?: AttrValue;
  y2?: AttrValue;
}

export function Line(props: LineProps = {}, children?: any) {
  let $elm: SVGLineElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-line",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface PolylineProps extends SVGBaseProps, SVGPresentationAttrs {
  points?: AttrValue;
}

export function Polyline(props: PolylineProps = {}, children?: any) {
  let $elm: SVGPolylineElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-polyline",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface PolygonProps extends SVGBaseProps, SVGPresentationAttrs {
  points?: AttrValue;
}

export function Polygon(props: PolygonProps = {}, children?: any) {
  let $elm: SVGPolygonElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-polygon",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface TextProps extends SVGBaseProps, SVGPresentationAttrs {
  x?: AttrValue;
  y?: AttrValue;
  dx?: AttrValue;
  dy?: AttrValue;
  "text-anchor"?: AttrValue;
  "dominant-baseline"?: AttrValue;
  "font-size"?: AttrValue;
  "font-family"?: AttrValue;
  "font-weight"?: AttrValue;
  "font-style"?: AttrValue;
  "letter-spacing"?: AttrValue;
  "word-spacing"?: AttrValue;
  "text-decoration"?: AttrValue;
  textLength?: AttrValue;
  lengthAdjust?: AttrValue;
  rotate?: AttrValue;
}

export function Text(props: TextProps = {}, children?: any) {
  let $elm: SVGTextElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-text",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface DefsProps extends SVGBaseProps {}

export function Defs(props: DefsProps = {}, children?: any) {
  let $elm: SVGDefsElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-defs",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface SymbolProps extends SVGBaseProps {
  viewBox?: AttrValue;
}

export function Symbol(props: SymbolProps = {}, children?: any) {
  let $elm: SVGSymbolElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-symbol",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface UseProps extends SVGBaseProps, SVGPresentationAttrs {
  href?: AttrValue;
  x?: AttrValue;
  y?: AttrValue;
  width?: AttrValue;
  height?: AttrValue;
}

export function Use(props: UseProps = {}, children?: any) {
  let $elm: SVGUseElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-use",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface LinearGradientProps extends SVGBaseProps {
  x1?: AttrValue;
  y1?: AttrValue;
  x2?: AttrValue;
  y2?: AttrValue;
  gradientUnits?: AttrValue;
  gradientTransform?: AttrValue;
  spreadMethod?: AttrValue;
}

export function LinearGradient(
  props: LinearGradientProps = {},
  children?: any,
) {
  let $elm: SVGLinearGradientElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-linear-gradient",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface RadialGradientProps extends SVGBaseProps {
  cx?: AttrValue;
  cy?: AttrValue;
  r?: AttrValue;
  fx?: AttrValue;
  fy?: AttrValue;
  gradientUnits?: AttrValue;
  gradientTransform?: AttrValue;
  spreadMethod?: AttrValue;
}

export function RadialGradient(
  props: RadialGradientProps = {},
  children?: any,
) {
  let $elm: SVGRadialGradientElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-radial-gradient",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface StopProps extends SVGBaseProps {
  offset?: AttrValue;
  "stop-color"?: AttrValue;
  "stop-opacity"?: AttrValue;
}

export function Stop(props: StopProps = {}, children?: any) {
  let $elm: SVGStopElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-stop",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface MaskProps extends SVGBaseProps {
  x?: AttrValue;
  y?: AttrValue;
  width?: AttrValue;
  height?: AttrValue;
  maskUnits?: AttrValue;
  maskContentUnits?: AttrValue;
}

export function Mask(props: MaskProps = {}, children?: any) {
  let $elm: SVGMaskElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-mask",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface ClipPathProps extends SVGBaseProps {
  clipPathUnits?: AttrValue;
}

export function ClipPath(props: ClipPathProps = {}, children?: any) {
  let $elm: SVGClipPathElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-clippath",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface EllipseProps extends SVGBaseProps, SVGPresentationAttrs {
  cx?: AttrValue;
  cy?: AttrValue;
  rx?: AttrValue;
  ry?: AttrValue;
}

export function Ellipse(props: EllipseProps = {}, children?: any) {
  let $elm: SVGEllipseElement | null = null;
  const box$ = createSVGBox(props, {});
  const state = box$.state;
  const events = box$.events;

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "svg-ellipse",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (props.onMounted) {
        box$.methods.unsubscribe(props.onMounted(event));
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export interface GProps extends SVGBaseProps, SVGPresentationAttrs {}

export interface CircleProps extends SVGBaseProps, SVGPresentationAttrs {
  cx?: AttrValue;
  cy?: AttrValue;
  r?: AttrValue;
}

export interface RectProps extends SVGBaseProps, SVGPresentationAttrs {
  x?: AttrValue;
  y?: AttrValue;
  width?: AttrValue;
  height?: AttrValue;
  rx?: AttrValue;
  ry?: AttrValue;
}

export interface PathProps extends SVGBaseProps, SVGPresentationAttrs {
  d?: string | DerivedRef<string> | Ref<string>;
  pathLength?: AttrValue;
}

export interface LineProps extends SVGBaseProps, SVGPresentationAttrs {
  x1?: AttrValue;
  y1?: AttrValue;
  x2?: AttrValue;
  y2?: AttrValue;
}

export interface PolylineProps extends SVGBaseProps, SVGPresentationAttrs {
  points?: AttrValue;
}

export interface PolygonProps extends SVGBaseProps, SVGPresentationAttrs {
  points?: AttrValue;
}

export interface TextProps extends SVGBaseProps, SVGPresentationAttrs {
  x?: AttrValue;
  y?: AttrValue;
  dx?: AttrValue;
  dy?: AttrValue;
  "text-anchor"?: AttrValue;
  "dominant-baseline"?: AttrValue;
  "font-size"?: AttrValue;
  "font-family"?: AttrValue;
  "font-weight"?: AttrValue;
  "font-style"?: AttrValue;
  "letter-spacing"?: AttrValue;
  "word-spacing"?: AttrValue;
  "text-decoration"?: AttrValue;
  textLength?: AttrValue;
  lengthAdjust?: AttrValue;
  rotate?: AttrValue;
}

export interface DefsProps extends SVGBaseProps {}

export interface SymbolProps extends SVGBaseProps {
  viewBox?: AttrValue;
}

export interface UseProps extends SVGBaseProps, SVGPresentationAttrs {
  href?: AttrValue;
  x?: AttrValue;
  y?: AttrValue;
  width?: AttrValue;
  height?: AttrValue;
}

export interface LinearGradientProps extends SVGBaseProps {
  x1?: AttrValue;
  y1?: AttrValue;
  x2?: AttrValue;
  y2?: AttrValue;
  gradientUnits?: AttrValue;
  gradientTransform?: AttrValue;
  spreadMethod?: AttrValue;
}

export interface RadialGradientProps extends SVGBaseProps {
  cx?: AttrValue;
  cy?: AttrValue;
  r?: AttrValue;
  fx?: AttrValue;
  fy?: AttrValue;
  gradientUnits?: AttrValue;
  gradientTransform?: AttrValue;
  spreadMethod?: AttrValue;
}

export interface StopProps extends SVGBaseProps {
  offset?: AttrValue;
  "stop-color"?: AttrValue;
  "stop-opacity"?: AttrValue;
}

export interface MaskProps extends SVGBaseProps {
  x?: AttrValue;
  y?: AttrValue;
  width?: AttrValue;
  height?: AttrValue;
  maskUnits?: AttrValue;
  maskContentUnits?: AttrValue;
}

export interface ClipPathProps extends SVGBaseProps {
  clipPathUnits?: AttrValue;
}

export interface EllipseProps extends SVGBaseProps, SVGPresentationAttrs {
  cx?: AttrValue;
  cy?: AttrValue;
  rx?: AttrValue;
  ry?: AttrValue;
}

interface SVGBaseProps {
  style?: ViewStyle;
  class?: string | DerivedRef<string> | Ref<string> | ClassNameRef;
  dataset?: Record<string, AttrValue>;
  attributes?: Record<string, AttrValue>;
  id?: AttrValue;
  tabindex?: AttrValue;
  role?: string;
  "aria-label"?: string;
  "aria-hidden"?: "true" | "false";
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  onMounted?(event: MountedEvent<SVGElement>): void;
  beforeUnmounted?(): void;
  onUnmounted?(): void;
  onClick?(e: MouseEvent): void;
  onPointerDown?(e: PointerEvent): void;
  onPointerUp?(e: PointerEvent): void;
  onPointerMove?(e: PointerEvent): void;
  onMouseEnter?(e: MouseEvent): void;
  onMouseLeave?(e: MouseEvent): void;
  onFocus?(e: FocusEvent): void;
  onBlur?(e: FocusEvent): void;
}

interface SVGPresentationAttrs {
  fill?: AttrValue;
  "fill-opacity"?: AttrValue;
  "fill-rule"?: AttrValue;
  stroke?: AttrValue;
  "stroke-width"?: AttrValue;
  "stroke-opacity"?: AttrValue;
  "stroke-linecap"?: AttrValue;
  "stroke-linejoin"?: AttrValue;
  "stroke-dasharray"?: AttrValue;
  "stroke-dashoffset"?: AttrValue;
  opacity?: AttrValue;
  transform?: AttrValue;
  "clip-path"?: AttrValue;
  "clip-rule"?: AttrValue;
  mask?: AttrValue;
  filter?: AttrValue;
  visibility?: AttrValue;
  display?: AttrValue;
  "pointer-events"?: AttrValue;
  cursor?: AttrValue;
}

function createElement<P extends SVGBaseProps>(
  props: P,
  createBox: (props: P) => ReturnType<typeof Box>,
) {
  const box$ = createBox(props);
  const state = box$.state;

  return {
    t: "svg",
    $elm: null as SVGGElement | null,
    state,
    children: state.children,
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.onUnmounted) {
          node.onUnmounted();
        }
      }
    },
    append(node: any) {
      state.children.push(node);
    },
  };
}
