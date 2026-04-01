import {
  Signal,
  isRef,
  isClassName,
  ClassNameRef,
  isStyleRef,
  StyleRef,
} from "@timeless/reactive";

import { getHost } from "@/host";
import { safeCreateElement, safeCreateTextNode } from "@/util/env";

import { Txt } from "./text";

export type AttributeValue = string | number | boolean | undefined | null;
export type MaybeSignal<T = AttributeValue> = T | Signal<T>;
export type ViewAttributes = Record<string, MaybeSignal>;

export interface ViewProps {
  as?: string;
  key?: string | number;
  style?: MaybeSignal<string> | StyleRef;
  class?: MaybeSignal<string> | ClassNameRef;
  draggable?: boolean;
  attributes?: ViewAttributes;
  dataset?: Record<string, MaybeSignal<AttributeValue>>;
  onMounted?(el: any): void | (() => void);
  beforeUnmounted?(): void;
  onUnmounted?(): void;
  onClick?(e: MouseEvent): void;
  onDoubleClick?(e: MouseEvent): void;
  onLongPress?(e: PointerEvent): void;
  onPointerDown?: (e: PointerEvent) => void;
  onFocus?(e: FocusEvent): void;
  onBlur?(e: FocusEvent): void;
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
}

export function View(
  props: ViewProps = {},
  children?: ViewChildren | ViewChildren[number],
) {
  const host = getHost();
  const {
    as = "div",
    style,
    class: cls,
    draggable,
    attributes,
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
    onContextMenu,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onAnimationEnd,
  } = props;
  let onMountedCleanup: (() => void) | undefined;
  const listenerCleanups: (() => void)[] = [];
  let rendered = false;
  let $elm: any = null;
  let _children = children ?? [];
  if (!Array.isArray(_children)) {
    _children = [_children];
  }

  // Helper: normalize children (convert functions, wrap refs)
  const normalizeChildren = () => {
    for (let i = 0; i < _children.length; i++) {
      let child = _children[i];
      if (typeof child === "function") {
        child = child();
        _children[i] = child;
      }
      if (isRef(child)) {
        _children[i] = Txt(child as any);
      }
    }
  };

  // Helper: apply attribute
  const applyAttr = (k: string, v: any) => {
    if (v === undefined || v === null || v === false) {
      host.removeAttribute($elm, k);
      return;
    }
    if (v === true) {
      host.setAttribute($elm, k, "");
      return;
    }
    host.setAttribute($elm, k, String(v));
  };

  // Helper: create event listener
  const listen = (
    target: any,
    type: string,
    handler: (event: any) => void,
    options?: any,
  ) => {
    host.addEventListener(target, type, handler, options);
    listenerCleanups.push(() => {
      host.removeEventListener(target, type, handler, options);
    });
  };

  // Helper: setup bindings (attributes, class, style, events)
  const setupBindings = () => {
    if (attributes) {
      Object.keys(attributes).forEach((k) => {
        const vv = attributes[k];
        if (isRef(vv)) {
          vv._subscribe({
            onChange(v) {
              applyAttr(k, v);
            },
          });
          applyAttr(k, vv.value);
          return;
        }
        applyAttr(k, vv);
      });
    }
    Object.keys(dataset).forEach((k) => {
      if (!dataset) return;
      const vv = dataset[k];
      const attrName = `data-${k}`;
      if (isRef(vv)) {
        vv._subscribe({
          onChange(v) {
            applyAttr(attrName, v);
          },
        });
        applyAttr(attrName, vv.value);
        return;
      }
      applyAttr(attrName, vv);
    });

    if (cls) {
      if (typeof cls === "string") {
        host.setClassName($elm, cls);
      } else if (isRef(cls)) {
        cls._subscribe({
          onChange(v: any) {
            host.setClassName($elm, v);
          },
        });
        host.setClassName($elm, cls.value);
      } else if (isClassName(cls)) {
        cls._subscribe({
          onChange(v: any) {
            host.setClassName($elm, v.join(" "));
          },
        });
        host.setClassName($elm, cls.toString());
      }
    }

    if (style) {
      if (typeof style === "string") {
        host.setStyleText($elm, style);
      } else if (isRef(style)) {
        host.setStyleText($elm, style.value);
        style._subscribe({
          onChange(v: any) {
            host.setStyleText($elm, v);
          },
        });
      } else if (isStyleRef(style)) {
        style._subscribe({
          onChange(v: any) {
            host.setStyleText($elm, v);
          },
        });
        host.setStyleText($elm, style.toString());
      }
    }

    if (onClick) {
      const handler = function (event: MouseEvent) {
        if (onClick) {
          onClick(event);
        }
      };
      listen($elm, "click", handler);
    }

    if (onDoubleClick) {
      const handler = function (event: MouseEvent) {
        if (onDoubleClick) {
          onDoubleClick(event);
        }
      };
      listen($elm, "dblclick", handler);
    }

    if (onLongPress) {
      let longPressTimer: any = null;
      let startX = 0;
      let startY = 0;
      const longPressDuration = 500;
      const moveThreshold = 10;

      const handleStart = (event: PointerEvent) => {
        startX = event.clientX;
        startY = event.clientY;
        longPressTimer = host.setTimeout(() => {
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
            host.clearTimeout(longPressTimer);
            longPressTimer = null;
          }
        }
      };

      const handleEnd = () => {
        if (longPressTimer) {
          host.clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      };

      listen($elm, "pointerdown", handleStart);
      listen($elm, "pointermove", handleMove);
      listen($elm, "pointerup", handleEnd);
      listen($elm, "pointercancel", handleEnd);
    }

    if (onPointerDown) {
      const handler = function (event: PointerEvent) {
        if (onPointerDown) onPointerDown(event);
      };
      listen($elm, "pointerdown", handler);
    }
    if (onFocus) {
      const handler = function (event: FocusEvent) {
        onFocus(event);
      };
      listen($elm, "focus", handler);
    }
    if (onBlur) {
      const handler = function (event: FocusEvent) {
        if (onBlur) onBlur(event);
      };
      listen($elm, "blur", handler);
    }
    if (onKeyDown) {
      const handler = function (event: KeyboardEvent) {
        if (onKeyDown) onKeyDown(event);
      };
      listen($elm, "keydown", handler);
    }
    if (onContextMenu) {
      const handler = function (event: MouseEvent) {
        if (onContextMenu) onContextMenu(event);
      };
      listen($elm, "contextmenu", handler);
    }
    if (onMouseEnter) {
      const handler = function (event: MouseEvent) {
        onMouseEnter(event);
      };
      listen($elm, "mouseenter", handler);
    }
    if (onMouseLeave) {
      const handler = function (event: MouseEvent) {
        onMouseLeave(event);
      };
      listen($elm, "mouseleave", handler);
    }

    if (draggable !== undefined) {
      host.setAttribute($elm, "draggable", String(draggable));
    }

    if (onDragStart) {
      const handler = function (event: DragEvent) {
        if (onDragStart) onDragStart(event);
      };
      listen($elm, "dragstart", handler);
    }

    if (onDrag) {
      const handler = function (event: DragEvent) {
        if (onDrag) onDrag(event);
      };
      listen($elm, "drag", handler);
    }

    if (onDragEnd) {
      const handler = function (event: DragEvent) {
        if (onDragEnd) onDragEnd(event);
      };
      listen($elm, "dragend", handler);
    }

    if (onDragEnter) {
      const handler = function (event: DragEvent) {
        if (onDragEnter) onDragEnter(event);
      };
      listen($elm, "dragenter", handler);
    }

    if (onDragOver) {
      const handler = function (event: DragEvent) {
        if (onDragOver) onDragOver(event);
      };
      listen($elm, "dragover", handler);
    }

    if (onDragLeave) {
      const handler = function (event: DragEvent) {
        if (onDragLeave) onDragLeave(event);
      };
      listen($elm, "dragleave", handler);
    }

    if (onDrop) {
      const handler = function (event: DragEvent) {
        if (onDrop) onDrop(event);
      };
      listen($elm, "drop", handler);
    }

    if (onAnimationEnd) {
      const handler = function (event: AnimationEvent) {
        if (onAnimationEnd) {
          onAnimationEnd(event);
        }
      };
      listen($elm, "animationend", handler);
    }
  };

  return {
    t: "view",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    _props: props,
    _children,
    render() {
      if (rendered) {
        return $elm;
      }
      rendered = true;

      // Create element if not already created
      if (!$elm) {
        $elm = safeCreateElement(as);
      }

      normalizeChildren();
      setupBindings();

      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (node === null || node === undefined) continue;
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
    hydrate(existingDom: any) {
      if (rendered) {
        return $elm;
      }
      rendered = true;

      $elm = existingDom;
      normalizeChildren();
      setupBindings();

      // Hydrate children recursively
      let childDom = host.getFirstChild($elm);
      for (let i = 0; i < _children.length; i += 1) {
        const node = _children[i];
        if (!node) continue;

        if (typeof node === "string" || typeof node === "number") {
          // Skip text nodes
          childDom = host.getNextSibling(childDom);
          continue;
        }

        if (isElement(node)) {
          if (childDom && typeof (node as any).hydrate === "function") {
            (node as any).hydrate(childDom);
            childDom = host.getNextSibling(node.$elm || childDom);
          } else if (childDom) {
            // Fallback: just assign $elm and setup
            node.$elm = childDom;
            node.render();
            childDom = host.getNextSibling(childDom);
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
        if (isElement(node) && node.onMounted) {
          node.onMounted(node.$elm);
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
      for (const fn of listenerCleanups) {
        fn();
      }
      listenerCleanups.length = 0;
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
      host.clearChildren($elm);
      // console.log("[View] onUnmounted completed");
    },
  };
}

export function isElement(v: unknown): v is TimelessElement {
  if (v === null || v === undefined) {
    return false;
  }
  // @ts-ignore
  if (v.t && v.hasOwnProperty('$elm')) {
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
  $elm: any;
  value?: unknown;
  render(): any;
  hydrate?(existingDom: any): any;
  cleanup?: () => void;
  onMounted?(el: any): void;
  beforeUnmounted?(): void;
  onUnmounted?(): void;
}

export type ViewChildren = (
  | TimelessElement
  | (() => TimelessElement)
  | string
  | number
  | MaybeSignal<string | number>
  | null
)[];
