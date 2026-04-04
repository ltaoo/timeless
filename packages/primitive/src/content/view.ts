import {
  Signal,
  Ref,
  isRef,
  isClassName,
  ClassNameRef,
  isStyleRef,
  StyleRef,
} from "@timeless/reactive";

import { safeCreateElement } from "@/util/env";
import { ViewStyleInput, ViewStyle } from "@/style/index";
import { MountedEvent } from "@/event/index";

import { Txt } from "./text";

export type AttributeValue = string | number | boolean | undefined | null;
export type MaybeSignal<T = AttributeValue> = T | Signal<T>;
export type ViewAttributes = Record<string, MaybeSignal>;

export interface ViewProps {
  key?: string | number;
  as?: string;
  style?:
    | ViewStyleInput
    | StyleRef
    | Signal<ViewStyleInput>
    | Ref<ViewStyleInput>;
  class?: MaybeSignal<string> | ClassNameRef;
  draggable?: boolean;
  attributes?: ViewAttributes;
  dataset?: Record<string, MaybeSignal<AttributeValue>>;
  onMounted?(event: MountedEvent): void | (() => void);
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

export function View(props: ViewProps = {}, children?: ViewChildren) {
  // const host = getHost();
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

  let $elm: any = null;

  const state = {
    rendered: false,
    children: children ?? [],
    get host() {
      return $elm;
    },
  };

  // Helper: normalize children (convert functions, wrap refs)
  function normalize_children() {
    for (let i = 0; i < state.children.length; i++) {
      let child = state.children[i];
      if (typeof child === "function") {
        child = child();
        state.children[i] = child;
      }
      if (isRef(child)) {
        state.children[i] = Txt(child as any);
      }
    }
  }

  // Helper: apply attribute
  function applyAttr(k: string, v: any) {
    if (v === undefined || v === null || v === false) {
      // host.removeAttribute($elm, k);
      $elm.removeAttribute(k);
      return;
    }
    if (v === true) {
      // host.setAttribute($elm, k, "");
      $elm.setAttribute(k, "");
      return;
    }
    // host.setAttribute($elm, k, String(v));
    $elm.setAttribute(k, String(v));
  }

  // Helper: create event listener
  function listen(
    target: any,
    type: string,
    handler: (event: any) => void,
    options?: any,
  ) {
    // host.addEventListener(target, type, handler, options);
    target.addEventListener(type, handler, options);
    listenerCleanups.push(() => {
      // host.removeEventListener(target, type, handler, options);
      target.removeEventListener(type, handler, options);
    });
  }

  // Helper: setup bindings (attributes, class, style, events)
  function setup_bindings() {
    if (attributes) {
      Object.keys(attributes).forEach((k) => {
        const vv = attributes[k];
        if (isRef(vv)) {
          vv._subscribe({
            onChange(v) {
              if ($elm) applyAttr(k, v);
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
            if ($elm) applyAttr(attrName, v);
          },
        });
        applyAttr(attrName, vv.value);
        return;
      }
      applyAttr(attrName, vv);
    });

    if (cls) {
      if (typeof cls === "string") {
        // host.setClassName($elm, cls);
        $elm.setStylePreset(cls);
      } else if (isRef(cls)) {
        cls._subscribe({
          onChange(v: any) {
            if ($elm) {
              // host.setClassName($elm, v);
              $elm.setStylePreset(v);
            }
          },
        });
        // host.setClassName($elm, cls.value);
        $elm.setStylePreset(cls.value);
      } else if (isClassName(cls)) {
        cls._subscribe({
          onChange(v: any) {
            if ($elm) {
              // host.setClassName($elm, v.join(" "));
              $elm.setStylePreset(v.join(" "));
            }
          },
        });
        // host.setClassName($elm, cls.toString());
        $elm.setStylePreset(cls.toString());
      }
    }

    if (style) {
      if (isStyleRef(style as any)) {
        const st = style as StyleRef;
        st._subscribe({
          onChange(v: any) {
            if ($elm) {
              // host.setStyleText($elm, viewStyleToCssText(v ?? {}));
              $elm.setStylePreset(v ?? {});
            }
          },
        });
        // host.setStyleText($elm, viewStyleToCssText(st.value));
        $elm.setStylePreset(st.value);
      } else if (isRef(style)) {
        const st = style as any;
        const apply = () => {
          if ($elm) {
            // host.setStyleText($elm, viewStyleToCssText(st.value || {}));
            $elm.setStylePreset(st.value || {});
          }
        };
        st._subscribe({
          onChange() {
            apply();
          },
        });
        apply();
      } else {
        const obj = style as ViewStyle;
        const applyStyle = () => {
          if ($elm) {
            // host.setStyleText($elm, viewStyleToCssText(obj));
            $elm.setStylePreset(obj);
          }
        };
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i += 1) {
          const k = keys[i];
          const vv = (obj as any)[k];
          if (isRef(vv)) {
            vv._subscribe({
              onChange() {
                applyStyle();
              },
            });
          }
        }
        applyStyle();
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
        longPressTimer = setTimeout(() => {
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
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
        }
      };

      const handleEnd = () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
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
      // host.setAttribute($elm, "draggable", String(draggable));
      $elm.setAttribute("draggable", String(draggable));
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
  }

  return {
    t: "view",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    // _props: props,
    // _children,
    render() {
      if (state.rendered) {
        return $elm;
      }
      state.rendered = true;

      // Create element if not already created
      if (!$elm) {
        $elm = safeCreateElement(as);
      }

      normalize_children();
      setup_bindings();

      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (node === null || node === undefined) continue;
        if (typeof node === "string" || typeof node === "number") {
          $elm.appendChild(Txt(String(node)));
          continue;
        }
        if (isElement(node)) {
          const result = node.render();
          if (result) {
            // host.appendChild($elm, result);
            $elm.appendChild(result);
          }
        }
      }
      if (onMounted) {
        const cleanup = onMounted({ target: $elm });
        if (typeof cleanup === "function") {
          onMountedCleanup = cleanup;
        }
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node)) {
          if (node.onMounted) {
            node.onMounted({ target: node.$elm });
          }
        }
      }
      return $elm;
    },
    hydrate(existingDom: any) {
      if (state.rendered) {
        return $elm;
      }
      state.rendered = true;

      $elm = existingDom;
      normalize_children();
      setup_bindings();

      // Hydrate children recursively
      // let childDom = host.getFirstChild($elm);
      let childDom = $elm.getFirstChild();
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (!node) continue;

        if (typeof node === "string" || typeof node === "number") {
          // Skip text nodes
          if (childDom) {
            // childDom = host.getNextSibling(childDom);
            childDom = childDom.getNextSibling();
          }
          continue;
        }

        if (isElement(node)) {
          if (typeof (node as any).hydrate === "function") {
            // 传递 $elm 作为 parentDom，即使 childDom 为 null 也要调用 hydrate
            (node as any).hydrate(childDom, $elm);
            if (childDom) {
              // childDom = host.getNextSibling(node.$elm || childDom);
              if (node.$elm) {
                childDom = node.$elm.getNextSibling();
              } else if (childDom) {
                childDom = childDom.getNextSibling();
              }
            }
          } else if (childDom) {
            // Fallback: just assign $elm and setup
            node.$elm = childDom;
            node.render();
            // childDom = host.getNextSibling(childDom);
            childDom = childDom.getNextSibling();
          } else {
            // childDom 为 null 时，直接 render 并插入
            const result = node.render();
            if (result) {
              // host.appendChild($elm, result);
              $elm.appendChild(result);
            }
          }
        }
      }

      if (onMounted) {
        const cleanup = onMounted({ target: $elm });
        if (typeof cleanup === "function") {
          onMountedCleanup = cleanup;
        }
      }

      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.onMounted) {
          node.onMounted({ target: node.$elm });
        }
      }

      return $elm;
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
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
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
      // host.clearChildren($elm);
      $elm.clearChildren();
      // console.log("[View] onUnmounted completed");

      // Reset state for potential re-render (e.g., when Show toggles when back to true)
      state.rendered = false;
      $elm = null;
    },
  };
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
  onMounted?(event: MountedEvent): void;
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
