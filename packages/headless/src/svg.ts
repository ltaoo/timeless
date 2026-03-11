import { Ref, isRef, isClassName } from "@timeless/reactive";
import { ViewProps, isElement } from "./view";

export function SVG(props: ViewProps = {}, children?: any) {
  const {
    type = "svg",
    style,
    class: cls,
    dataset = {},
    onMounted,
    onUnmounted,
    onClick,
    onFocus,
    onBlur,
    beforeUnmounted,
    ...rest
  } = props;
  const $elm = document.createElementNS("http://www.w3.org/2000/svg", type);

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
      $elm.innerHTML = html;
    },
    render() {
      Object.keys(rest).forEach((k) => {
        // @ts-ignore
        const vv = rest[k];
        if (vv) {
          if (isRef(vv)) {
            vv._subscribe({
              onChange(v) {
                $elm.setAttribute(k, String(v));
              },
            });
            $elm.setAttribute(k, String(vv.value));
          } else if (typeof vv === "string" || typeof vv === "number") {
            $elm.setAttribute(k, String(vv));
          }
        }
      });
      Object.keys(dataset).forEach((k) => {
        if (dataset && dataset[k]) {
          $elm.setAttribute(`data-${k}`, dataset[k]);
        }
      });

      if (cls) {
        if (typeof cls === "string") {
          $elm.setAttribute("class", cls);
        } else if (isRef(cls)) {
          cls._subscribe({
            onChange(v) {
              $elm.setAttribute("class", v);
            },
          });
          $elm.setAttribute("class", cls.value);
        } else if (isClassName(cls)) {
          cls._subscribe({
            onChange(v: string[]) {
              $elm.setAttribute("class", v.join(" "));
            },
          });
          $elm.setAttribute("class", cls.toString());
        }
      }

      if (style) {
        if (typeof style === "string") {
          $elm.style.cssText = style;
        }
        if (isRef(style)) {
          $elm.style.cssText = style.value;
          style._subscribe({
            onChange(v: any) {
              $elm.style.cssText = v;
            },
          });
        }
      }
      if (onClick) {
        $elm.addEventListener("click", function (event) {
          if (onClick) {
            onClick(event);
          }
        });
      }
      if (onFocus) {
        $elm.addEventListener("focus", function (event) {
          if (onFocus) onFocus(event);
        });
      }
      if (onBlur) {
        $elm.addEventListener("blur", function (event) {
          if (onBlur) onBlur(event);
        });
      }

      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (!node) continue;
        if (typeof node === "string" || typeof node === "number") {
          $elm.appendChild(document.createTextNode(String(node)));
          continue;
        }
        if (isElement(node)) {
          const result = node.render();
          if (result) {
            $elm.appendChild(result);
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

export function G(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "g" }, children);
}

export function Circle(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "circle" }, children);
}

export function Rect(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "rect" }, children);
}

export function Path(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "path" }, children);
}

export function Line(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "line" }, children);
}

export function Polyline(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "polyline" }, children);
}

export function Polygon(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "polygon" }, children);
}

export function Text(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "text" }, children);
}

export function Defs(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "defs" }, children);
}

export function Symbol(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "symbol" }, children);
}

export function Use(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "use" }, children);
}

export function LinearGradient(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "linearGradient" }, children);
}

export function RadialGradient(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "radialGradient" }, children);
}

export function Stop(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "stop" }, children);
}

export function Mask(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "mask" }, children);
}

export function ClipPath(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "clipPath" }, children);
}

export function Ellipse(props: ViewProps = {}, children?: any) {
  return SVG({ ...props, type: "ellipse" }, children);
}
