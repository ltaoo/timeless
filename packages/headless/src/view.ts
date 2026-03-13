import {
  Ref,
  isRef,
  isClassName,
  ClassNameRef,
  isStyleRef,
  StyleRef,
} from "@timeless/reactive";

import { Txt } from "./text";

export interface ViewProps {
  as?: string;
  type?: string;
  id?: string | Ref<string>;
  style?: string | Ref<string> | StyleRef;
  class?: string | Ref<string> | ClassNameRef;
  dataset?: Record<string, string>;
  htmlFor?: string;
  "tab-index"?: number | Ref<number | undefined>;
  tabindex?: number | Ref<number | undefined>;
  onMounted?(
    el: HTMLElement | SVGElement | Text | DocumentFragment,
  ): void | (() => void);
  beforeUnmounted?(): void;
  onUnmounted?(): void;
  onClick?(e: MouseEvent): void;
  onDoubleClick?(e: MouseEvent): void;
  onLongPress?(e: PointerEvent): void;
  onPointerDown?: (e: PointerEvent) => void;
  onFocus?(e: FocusEvent): void;
  onBlur?(e: FocusEvent): void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onDragStart?: (e: DragEvent) => void;
  onDrag?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
  onDragEnter?: (e: DragEvent) => void;
  onDragOver?: (e: DragEvent) => void;
  onDragLeave?: (e: DragEvent) => void;
  onDrop?: (e: DragEvent) => void;
  draggable?: boolean;
  key?: string | number;
}

export function View(
  props: ViewProps = {},
  children?: ViewChildren | ViewChildren[number],
) {
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
    onDoubleClick,
    onLongPress,
    onFocus,
    onBlur,
    onPointerDown,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    draggable,
    ...rest
  } = props;
  let onMountedCleanup: (() => void) | undefined;
  const $elm = document.createElement(as || type);
  let _children = children ?? [];
  if (!Array.isArray(_children)) {
    _children = [_children];
  }

  return {
    t: "view",
    $elm,
    render() {
      for (let i = 0; i < _children.length; i++) {
        let child = _children[i];
        // 处理 h() 返回的延迟执行函数
        if (typeof child === "function") {
          child = child();
          _children[i] = child;
        }
        if (isRef(child)) {
          _children[i] = Txt(child);
        }
      }

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
              $elm.className = v.join(" ");
            },
          });
          $elm.className = cls.toString();
        }
      }

      if (style) {
        if (typeof style === "string") {
          $elm.style.cssText = style;
        } else if (isRef(style)) {
          $elm.style.cssText = style.value;
          style._subscribe({
            onChange(v: any) {
              $elm.style.cssText = v;
            },
          });
        } else if (isStyleRef(style)) {
          style._subscribe({
            onChange(v: string) {
              $elm.style.cssText = v;
            },
          });
          $elm.style.cssText = style.toString();
        }
      }
      if (onClick) {
        $elm.addEventListener("click", function (event: MouseEvent) {
          if (onClick) {
            onClick(event);
          }
        });
      }

      // Double click support for both mobile and desktop
      if (onDoubleClick) {
        $elm.addEventListener("dblclick", function (event: MouseEvent) {
          if (onDoubleClick) {
            onDoubleClick(event);
          }
        });
      }

      // Long press support for both mobile and desktop
      if (onLongPress) {
        let longPressTimer: number | null = null;
        let startX = 0;
        let startY = 0;
        const longPressDuration = 500; // 500ms
        const moveThreshold = 10; // 10px movement threshold

        const handleStart = (event: PointerEvent) => {
          startX = event.clientX;
          startY = event.clientY;
          longPressTimer = window.setTimeout(() => {
            if (onLongPress) {
              onLongPress(event);
            }
            longPressTimer = null;
          }, longPressDuration);
        };

        const handleMove = (event: PointerEvent) => {
          if (longPressTimer) {
            const deltaX = Math.abs(event.clientX - startX);
            const deltaY = Math.abs(event.clientY - startY);
            if (deltaX > moveThreshold || deltaY > moveThreshold) {
              window.clearTimeout(longPressTimer);
              longPressTimer = null;
            }
          }
        };

        const handleEnd = () => {
          if (longPressTimer) {
            window.clearTimeout(longPressTimer);
            longPressTimer = null;
          }
        };

        $elm.addEventListener("pointerdown", handleStart);
        $elm.addEventListener("pointermove", handleMove);
        $elm.addEventListener("pointerup", handleEnd);
        $elm.addEventListener("pointercancel", handleEnd);
      }

      if (onPointerDown) {
        $elm.addEventListener("pointerdown", function (event: PointerEvent) {
          if (onPointerDown) onPointerDown(event);
        });
      }
      if (onFocus) {
        $elm.addEventListener("focus", function (event: FocusEvent) {
          onFocus(event);
        });
      }
      if (onBlur) {
        $elm.addEventListener("blur", function (event: FocusEvent) {
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

      // Drag and drop events
      if (draggable !== undefined) {
        $elm.setAttribute("draggable", String(draggable));
      }

      if (onDragStart) {
        $elm.addEventListener("dragstart", function (event: DragEvent) {
          if (onDragStart) onDragStart(event);
        });
      }

      if (onDrag) {
        $elm.addEventListener("drag", function (event: DragEvent) {
          if (onDrag) onDrag(event);
        });
      }

      if (onDragEnd) {
        $elm.addEventListener("dragend", function (event: DragEvent) {
          if (onDragEnd) onDragEnd(event);
        });
      }

      if (onDragEnter) {
        $elm.addEventListener("dragenter", function (event: DragEvent) {
          if (onDragEnter) onDragEnter(event);
        });
      }

      if (onDragOver) {
        $elm.addEventListener("dragover", function (event: DragEvent) {
          if (onDragOver) onDragOver(event);
        });
      }

      if (onDragLeave) {
        $elm.addEventListener("dragleave", function (event: DragEvent) {
          if (onDragLeave) onDragLeave(event);
        });
      }

      if (onDrop) {
        $elm.addEventListener("drop", function (event: DragEvent) {
          if (onDrop) onDrop(event);
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
        const cleanup = onMounted($elm);
        if (typeof cleanup === "function") {
          onMountedCleanup = cleanup;
        }
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
      // console.log(
      //   "[View] onUnmounted called, children count:",
      //   _children.length,
      // );
      if (onMountedCleanup) {
        // console.log("[View] calling onMounted cleanup function");
        onMountedCleanup();
      }
      if (props.onUnmounted) {
        // console.log("[View] calling props.onUnmounted");
        props.onUnmounted();
      }
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (isElement(node)) {
          // 如果是 Portal 组件，调用其 cleanup 方法
          if (node.t === "portal" && typeof node.cleanup === "function") {
            // console.log("[View] calling cleanup on Portal child");
            node.cleanup();
          } else if (node.onUnmounted) {
            // 否则调用标准的 onUnmounted
            // console.log("[View] calling onUnmounted on child:", node.t);
            node.onUnmounted();
          }
        }
      }
      // console.log("[View] clearing DOM, firstChild:", !!$elm.firstChild);
      while ($elm.firstChild) {
        $elm.removeChild($elm.firstChild);
      }
      // console.log("[View] onUnmounted completed");
    },
  };
}

export function isElement(v: unknown): v is TimelessElement {
  if (v === null || v === undefined) {
    return false;
  }
  // @ts-ignore
  if (v.t && v.$elm) {
    return true;
  }
  return false;
}
export function isLazyElement(v: unknown): v is TimelessLazyComponent {
  if (v === null || v === undefined) {
    return false;
  }
  if (
    v instanceof Promise ||
    (v && typeof (v as Promise<unknown>).then === "function")
  ) {
    return true;
  }
  return false;
}

export type TimelessNormalComponent = (...args: unknown[]) => TimelessElement;
export type TimelessLazyComponent = () => Promise<{
  default: TimelessNormalComponent;
}>;
export type TimelessComponent = TimelessNormalComponent | TimelessLazyComponent;

export interface TimelessElement {
  t: string;
  $elm: HTMLElement | SVGElement | Text | DocumentFragment;
  value?: unknown;
  render(): HTMLElement | SVGElement | Text | DocumentFragment | null;
  cleanup?: () => void;
  onMounted?(el: HTMLElement | SVGElement | Text | DocumentFragment): void;
  beforeUnmounted?(): void;
  onUnmounted?(): void;
}

export type ViewChildren = (
  | TimelessElement
  | (() => TimelessElement)
  | string
  | number
  | Ref<string | number>
  | null
)[];
