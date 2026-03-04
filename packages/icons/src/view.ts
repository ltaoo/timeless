import { Ref, isRef, isClassName, ClassNameRef } from "@timeless/reactive";

export interface ViewProps {
  as?: string;
  type?: string;
  id?: string | Ref<string>;
  style?: string | Ref<string>;
  class?: string | Ref<string> | ClassNameRef;
  dataset?: Record<string, string>;
  "tab-index"?: number | Ref<number | undefined>;
  onMounted?(el: any): void;
  beforeUnmounted?(): void;
  onUnmounted?(): void;
  onClick?(e: any): void;
  onPointerDown?: (e: any) => void;
  onFocus?(e: any): void;
  onBlur?(e: any): void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  key?: any;
}

export function View(props: ViewProps = {}, children?: any) {
  const {
    type = "div",
    as,
    style,
    class: cls,
    dataset = {},
    onMounted,
    onUnmounted,
    beforeUnmounted,
    onClick,
    onFocus,
    onBlur,
    onPointerDown,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    ...rest
  } = props;
  const $elm = document.createElement(as || type);

  Object.keys(rest).forEach((k) => {
    // @ts-ignore
    const vv = rest[k];
    if (vv) {
      if (isRef(vv)) {
        vv._subscribe({
          onChange(v) {
            $elm.setAttribute(k, v);
          },
        });
        $elm.setAttribute(k, vv.value);
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
      $elm.className = cls;
    } else if (isRef(cls)) {
      cls._subscribe({
        onChange(v) {
          $elm.className = v;
        },
      });
      $elm.className = cls.value;
    } else if (isClassName(cls)) {
      cls._subscribe({
        onChange(v: string[]) {
          // console.log("[]view the className is changed", v);
          $elm.className = v.join(" ");
        },
      });
      $elm.className = cls.toString();
    }
  }
  // if (tmpid) {
  //   if (isRef(tmpid)) {
  //     $elm.id = tmpid.value;
  //   } else {
  //     $elm.id = tmpid;
  //   }
  // }

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
    // console.log("[baseui]View - register click", props.class, props.dataset);
    $elm.addEventListener("click", function (event: Event) {
      // console.log("[baseui]View - click", event.target, props.dataset);
      if (onClick) {
        onClick(event);
      }
    });
  }
  if (onPointerDown) {
    $elm.addEventListener("pointerdown", function (event: Event) {
      if (onPointerDown) onPointerDown(event);
    });
  }
  if (onFocus) {
    $elm.addEventListener("focus", function (event: Event) {
      if (onFocus) onFocus(event);
    });
  }
  if (onBlur) {
    $elm.addEventListener("blur", function (event: Event) {
      if (onBlur) onBlur(event);
    });
  }
  if (onKeyDown) {
    $elm.addEventListener("keydown", function (event: KeyboardEvent) {
      if (onKeyDown) onKeyDown(event);
    });
  }
  if (onMouseEnter) {
    $elm.addEventListener("mouseenter", function (event: MouseEvent) {
      onMouseEnter(event);
    });
  }
  if (onMouseLeave) {
    $elm.addEventListener("mouseleave", function (event: MouseEvent) {
      onMouseLeave(event);
    });
  }

  let _children = children ?? [];
  if (!Array.isArray(_children)) {
    _children = [_children];
  }

  for (let i = 0; i < _children.length; i++) {
    const child = _children[i];
    if (isRef(child)) {
      _children[i] = Txt(child);
    }
  }

  return {
    t: "view",
    $elm,
    // class$,
    // onMounted() {

    // },
    append(node: any) {
      _children.push(node);
    },
    setContent(html: string) {
      $elm.innerHTML = html;
    },
    render() {
      // Clear existing content before re-rendering to avoid duplicates
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
      // console.log("[baseui]View - invoke onMounted", $elm);
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
      // $elm.className = class$.toString();
      return $elm;
    },
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
      console.log(
        "[View] onUnmounted called, children count:",
        _children.length,
      );
      if (props.onUnmounted) {
        console.log("[View] calling props.onUnmounted");
        props.onUnmounted();
      }
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (isElement(node)) {
          // 如果是 Portal 组件，调用其 cleanup 方法
          if (node.t === "portal" && typeof node.cleanup === "function") {
            console.log("[View] calling cleanup on Portal child");
            node.cleanup();
          } else if (node.onUnmounted) {
            // 否则调用标准的 onUnmounted
            console.log("[View] calling onUnmounted on child:", node.t);
            node.onUnmounted();
          }
        }
      }
      console.log("[View] clearing DOM, firstChild:", !!$elm.firstChild);
      while ($elm.firstChild) {
        $elm.removeChild($elm.firstChild);
      }
      console.log("[View] onUnmounted completed");
    },
  };
}

export function isElement(v: any): v is TimelessElement {
  if (v === null || v === undefined) {
    return false;
  }
  if (v.t && v.$elm) {
    return true;
  }
  return false;
}
export function isLazyElement(v: any): v is TimelessLazyComponent {
  if (v === null || v === undefined) {
    return false;
  }
  if (v instanceof Promise || (v && typeof (v as any).then === "function")) {
    return true;
  }
  return false;
}

export type TimelessNormalComponent = (...args: any[]) => TimelessElement;
export type TimelessLazyComponent = () => Promise<{
  default: TimelessNormalComponent;
}>;
export type TimelessComponent = TimelessNormalComponent | TimelessLazyComponent;

export interface TimelessElement {
  t: string;
  $elm: HTMLElement | SVGElement | Text | DocumentFragment;
  render(): HTMLElement | SVGElement | Text | DocumentFragment | null;
  cleanup?: () => void;
  onMounted?(el: HTMLElement | SVGElement | Text | DocumentFragment): void;
  beforeUnmounted?(): void;
  onUnmounted?(): void;
}

export type ViewChildren = (
  | TimelessElement
  | string
  | number
  | Ref<string | number>
  | null
)[];

export function DangerouslyInnerHTML(html: string | Ref<string>) {
  const $elm = document.createElement("div");

  let _local_value = (() => {
    if (isRef(html)) {
      return html.value;
    }
    return html;
  })();
  if (isRef(html)) {
    html._subscribe({
      onChange: (v) => {
        $elm.innerHTML = v;
      },
    });
    _local_value = html.value;
  }

  return {
    t: "html",
    $elm: $elm,
    render() {
      $elm.innerHTML = _local_value;
      return $elm;
    },
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {
      $elm.innerHTML = "";
    },
    append(node: any) {
      $elm.appendChild(node);
    },
    setContent(html: string) {
      $elm.innerHTML = html;
    },
    class$: null,
  };
}

export function Txt(value: Ref<any> | string) {
  let _local_value = isRef(value) ? value.value : value;
  if (isRef(value)) {
    value._subscribe({
      onPatch(action) {},
      onChange(v: any) {
        // console.log("compare", v, _local_value);
        if (v === _local_value) {
          return;
        }
        _local_value = v;
        $elm.textContent = _local_value;
      },
    });
  }
  const $elm = document.createTextNode(_local_value);
  return {
    t: "text",
    $elm,
    render() {
      return $elm;
    },
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {
      // console.log("the text unmounted", _local_value);
    },
  };
}
