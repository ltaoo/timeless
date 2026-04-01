import { Ref, isRef, isClassName, ClassNameRef } from "@timeless/reactive";

import { isElement } from "@/primitive/view";
import { getHost } from "@/host";
import { safeCreateElementNS, safeCreateTextNode } from "@/util/env";

type AttrValue = string | number | Ref<string> | Ref<number>;

/** Props shared by all SVG elements (lifecycle, events, style, class) */
interface SVGBaseProps {
  style?: string | Ref<string>;
  class?: string | Ref<string> | ClassNameRef;
  dataset?: Record<string, string>;
  id?: AttrValue;
  tabindex?: AttrValue;
  role?: string;
  "aria-label"?: string;
  "aria-hidden"?: "true" | "false";
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  onMounted?(el: SVGElement): void;
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
  d?: AttrValue;
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

type InternalSVGProps = SVGBaseProps &
  SVGPresentationAttrs & { type?: string } & Record<string, any>;

function createSVGElement(props: InternalSVGProps = {}, children?: any) {
  const host = getHost();
  const {
    type = "svg",
    style,
    class: cls,
    dataset = {},
    onMounted,
    onUnmounted,
    onClick,
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    beforeUnmounted,
    ...rest
  } = props;
  const $elm = safeCreateElementNS("http://www.w3.org/2000/svg", type);

  let _children = children ?? [];
  if (!Array.isArray(_children)) {
    _children = [_children];
  }

  return {
    t: "svg",
    $elm,
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (isElement(node) && node.onUnmounted) {
          node.onUnmounted();
        }
      }
    },
    append(node: any) {
      _children.push(node);
    },
    setContent(html: string) {
      host.setInnerHTML?.($elm, html);
    },
    render() {
      Object.keys(rest).forEach((k) => {
        // @ts-ignore
        const vv = rest[k];
        if (vv) {
          if (isRef(vv)) {
            vv._subscribe({
              onChange(v) {
                host.setAttribute($elm, k, String(v));
              },
            });
            host.setAttribute($elm, k, String(vv.value));
          } else if (typeof vv === "string" || typeof vv === "number") {
            host.setAttribute($elm, k, String(vv));
          }
        }
      });
      Object.keys(dataset).forEach((k) => {
        if (dataset && dataset[k]) {
          host.setAttribute($elm, `data-${k}`, dataset[k]);
        }
      });

      if (cls) {
        if (typeof cls === "string") {
          host.setAttribute($elm, "class", cls);
        } else if (isRef(cls)) {
          cls._subscribe({
            onChange(v) {
              host.setAttribute($elm, "class", v);
            },
          });
          host.setAttribute($elm, "class", cls.value);
        } else if (isClassName(cls)) {
          cls._subscribe({
            onChange(v: string[]) {
              host.setAttribute($elm, "class", v.join(" "));
            },
          });
          host.setAttribute($elm, "class", cls.toString());
        }
      }

      if (style) {
        if (typeof style === "string") {
          host.setStyleText($elm, style);
        }
        if (isRef(style)) {
          host.setStyleText($elm, style.value);
          style._subscribe({
            onChange(v: any) {
              host.setStyleText($elm, v);
            },
          });
        }
      }
      if (onClick) {
        host.addEventListener($elm, "click", function (event: any) {
          if (onClick) {
            onClick(event);
          }
        });
      }
      if (onFocus) {
        host.addEventListener($elm, "focus", function (event: any) {
          if (onFocus) onFocus(event);
        });
      }
      if (onBlur) {
        host.addEventListener($elm, "blur", function (event: any) {
          if (onBlur) onBlur(event);
        });
      }
      if (onPointerDown) {
        host.addEventListener($elm, "pointerdown", function (event: any) {
          if (onPointerDown) onPointerDown(event);
        });
      }
      if (onPointerUp) {
        host.addEventListener($elm, "pointerup", function (event: any) {
          if (onPointerUp) onPointerUp(event);
        });
      }
      if (onPointerMove) {
        host.addEventListener($elm, "pointermove", function (event: any) {
          if (onPointerMove) onPointerMove(event);
        });
      }
      if (onMouseEnter) {
        host.addEventListener($elm, "mouseenter", function (event: any) {
          if (onMouseEnter) onMouseEnter(event);
        });
      }
      if (onMouseLeave) {
        host.addEventListener($elm, "mouseleave", function (event: any) {
          if (onMouseLeave) onMouseLeave(event);
        });
      }

      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (!node) continue;
        if (typeof node === "string" || typeof node === "number") {
          host.appendChild($elm, safeCreateTextNode(String(node)));
          continue;
        }
        if (isElement(node)) {
          const result = node.render();
          if (result) {
            host.appendChild($elm, result);
          }
        }
      }
      if (onMounted) {
        onMounted($elm);
      }
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (isElement(node)) {
          if (node.onMounted) {
            node.onMounted(node.$elm);
          }
        }
      }
      return $elm;
    },
  };
}

export function SVG(props: SVGProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "svg" } as InternalSVGProps,
    children,
  );
}

export function G(props: GProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "g" } as InternalSVGProps,
    children,
  );
}

export function Circle(props: CircleProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "circle" } as InternalSVGProps,
    children,
  );
}

export function Rect(props: RectProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "rect" } as InternalSVGProps,
    children,
  );
}

export function Path(props: PathProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "path" } as InternalSVGProps,
    children,
  );
}

export function Line(props: LineProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "line" } as InternalSVGProps,
    children,
  );
}

export function Polyline(props: PolylineProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "polyline" } as InternalSVGProps,
    children,
  );
}

export function Polygon(props: PolygonProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "polygon" } as InternalSVGProps,
    children,
  );
}

export function Text(props: TextProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "text" } as InternalSVGProps,
    children,
  );
}

export function Defs(props: DefsProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "defs" } as InternalSVGProps,
    children,
  );
}

// export function Symbol(props: SymbolProps = {}, children?: any) {
//   return createSVGElement(
//     { ...props, type: "symbol" } as InternalSVGProps,
//     children,
//   );
// }

export function Use(props: UseProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "use" } as InternalSVGProps,
    children,
  );
}

export function LinearGradient(
  props: LinearGradientProps = {},
  children?: any,
) {
  return createSVGElement(
    { ...props, type: "linearGradient" } as InternalSVGProps,
    children,
  );
}

export function RadialGradient(
  props: RadialGradientProps = {},
  children?: any,
) {
  return createSVGElement(
    { ...props, type: "radialGradient" } as InternalSVGProps,
    children,
  );
}

export function Stop(props: StopProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "stop" } as InternalSVGProps,
    children,
  );
}

export function Mask(props: MaskProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "mask" } as InternalSVGProps,
    children,
  );
}

export function ClipPath(props: ClipPathProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "clipPath" } as InternalSVGProps,
    children,
  );
}

export function Ellipse(props: EllipseProps = {}, children?: any) {
  return createSVGElement(
    { ...props, type: "ellipse" } as InternalSVGProps,
    children,
  );
}
