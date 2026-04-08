import { DerivedRef, Ref, Signal, isRef } from "@timeless/reactive";

import {
  ViewStyleProperties,
  ViewStyle,
  isClassNameRef,
  ClassNameRef,
} from "@/style/index";
import { MountedEvent } from "@/event/index";
import { ListenerManager } from "@/util/listener";

import { Txt } from "./text";
import {
  isElement,
  TimelessElement,
  ViewAttributes,
  ViewChildren,
} from "./type";

export interface ViewProps {
  key?: string | number;
  as?: string;
  style?: ViewStyle;
  class?: string | DerivedRef<string> | Ref<string> | ClassNameRef;
  draggable?: boolean;
  attributes?: ViewAttributes;
  dataset?: Record<
    string,
    | undefined
    | string
    | number
    | DerivedRef<string | number | boolean | undefined>
    | Ref<string | number | boolean | undefined>
  >;
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
type ViewState = {
  rendered: boolean;
  attributes: Record<string, string | number | boolean | undefined>;
  props: {
    styleSet?: string[] | Signal<string[]>;
    style: ViewStyleProperties;
  };
  events: Partial<{
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
  }>;
  children: (TimelessElement | null)[];
};

export function View(props: ViewProps = {}, children?: ViewChildren) {
  const {
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

  const manager$ = ListenerManager();

  let $elm: any = null;

  const state: ViewState = {
    rendered: false,
    props: {
      style: {},
    },
    attributes: {},
    events: {
      onClick,
      onDoubleClick,
      onLongPress,
      onPointerDown,
      onFocus,
      onBlur,
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
    },
    children: [],
  };

  const methods = {
    // Helper: normalize children (convert functions, wrap refs)
    setup_children(children?: ViewChildren) {
      if (!children) {
        return;
      }
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // console.log("for children", child);
        (() => {
          // if (typeof child === "function") {
          //   const r = child();
          //   state.children[i] = r;
          //   return;
          // }
          if (isElement(child)) {
            state.children[i] = child;
            return;
          }
          if (isRef(child)) {
            state.children[i] = Txt(child);
            return;
          }
          if (child) {
            state.children[i] = Txt(String(child));
            return;
          }
          // state.children[i] = null;
        })();
      }
    },

    // Helper: apply attribute
    apply_attr(k: string, v: any) {
      if (v === undefined || v === null || v === false) {
        // host.removeAttribute($elm, k);
        if ($elm && typeof $elm.removeAttribute === "function") {
          $elm.removeAttribute(k);
        }
        return;
      }
      if (v === true) {
        // host.setAttribute($elm, k, "");
        if ($elm && typeof $elm.setAttribute === "function") {
          $elm.setAttribute(k, "");
        }
        return;
      }
      // host.setAttribute($elm, k, String(v));
      if ($elm && typeof $elm.setAttribute === "function") {
        $elm.setAttribute(k, String(v));
      }
    },

    // Helper: create event listener
    listen(
      target: any,
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      // host.addEventListener(target, type, handler, options);
      target.addEventListener(type, handler, options);
      manager$.push(() => {
        // host.removeEventListener(target, type, handler, options);
        target.removeEventListener(type, handler, options);
      });
    },

    // Helper: setup bindings (attributes, class, style, events)
    setup_value_subscribe() {
      if (attributes) {
        Object.keys(attributes).forEach((k) => {
          const vv = attributes[k];
          if (isRef(vv)) {
            vv.subscribe({
              onChange(v) {
                if ($elm) {
                  methods.apply_attr(k, v);
                }
              },
            });
            methods.apply_attr(k, vv.value);
            return;
          }
          methods.apply_attr(k, vv);
        });
      }
      Object.keys(dataset).forEach((k) => {
        const vv = dataset[k];
        const attr_name = `data-${k}`;
        if (isRef(vv)) {
          vv.subscribe({
            onChange(v) {
              if ($elm) {
                methods.apply_attr(attr_name, v);
              }
            },
          });
          // methods.apply_attr(attr_name, vv.value);
          state.attributes[attr_name] = vv.value;
          return;
        }
        state.attributes[attr_name] = vv;
        // methods.apply_attr(attr_name, vv);
      });

      if (cls) {
        if (typeof cls === "string") {
          state.props.styleSet = [cls];
        } else if (isRef(cls)) {
          cls.subscribe({
            onChange(v: any) {
              if ($elm) {
                // host.setClassName($elm, v);
                $elm.setStyleSet(v);
              }
            },
          });
          state.props.styleSet = [cls.value];
        } else if (isClassNameRef(cls)) {
          cls.subscribe({
            onChange(v: any) {
              if ($elm) {
                $elm.setStyleSet(v.join(" "));
              }
            },
          });
          state.props.styleSet = cls.toString().split(" ");
        } else {
          state.props.styleSet = [];
        }
      }
      if (style) {
        if (isRef(style)) {
          state.props.style = (style.value || {}) as ViewStyleProperties;
          style.subscribe({
            onChange() {
              state.props.style = {
                ...state.props.style,
                ...(style.value || {}),
              };
              if ($elm && typeof $elm.setStyle === "function") {
                $elm.setStyle(state.props.style);
              }
            },
          });
        } else {
          Object.keys(style).forEach((k) => {
            const v = style[k];
            if (isRef(v)) {
              state.props.style[k] = v.value;
              v.subscribe({
                onChange(v) {
                  if ($elm) {
                    $elm.setStyleValue(k, v);
                  }
                },
              });
            } else {
              state.props.style[k] = v;
            }
          });
        }
      }

      if (!$elm) {
        return;
      }

      if (onClick) {
        const handler = function (event: MouseEvent) {
          if (onClick) {
            onClick(event);
          }
        };
        methods.listen($elm, "click", handler);
      }

      if (onDoubleClick) {
        const handler = function (event: MouseEvent) {
          if (onDoubleClick) {
            onDoubleClick(event);
          }
        };
        methods.listen($elm, "dblclick", handler);
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

        methods.listen($elm, "pointerdown", handleStart);
        methods.listen($elm, "pointermove", handleMove);
        methods.listen($elm, "pointerup", handleEnd);
        methods.listen($elm, "pointercancel", handleEnd);
      }

      if (onPointerDown) {
        const handler = function (event: PointerEvent) {
          if (onPointerDown) onPointerDown(event);
        };
        methods.listen($elm, "pointerdown", handler);
      }
      if (onFocus) {
        const handler = function (event: FocusEvent) {
          onFocus(event);
        };
        methods.listen($elm, "focus", handler);
      }
      if (onBlur) {
        const handler = function (event: FocusEvent) {
          if (onBlur) onBlur(event);
        };
        methods.listen($elm, "blur", handler);
      }
      if (onKeyDown) {
        const handler = function (event: KeyboardEvent) {
          if (onKeyDown) onKeyDown(event);
        };
        methods.listen($elm, "keydown", handler);
      }
      if (onContextMenu) {
        const handler = function (event: MouseEvent) {
          if (onContextMenu) onContextMenu(event);
        };
        methods.listen($elm, "contextmenu", handler);
      }
      if (onMouseEnter) {
        const handler = function (event: MouseEvent) {
          onMouseEnter(event);
        };
        methods.listen($elm, "mouseenter", handler);
      }
      if (onMouseLeave) {
        const handler = function (event: MouseEvent) {
          onMouseLeave(event);
        };
        methods.listen($elm, "mouseleave", handler);
      }

      if (draggable !== undefined) {
        // host.setAttribute($elm, "draggable", String(draggable));
        $elm.setAttribute("draggable", String(draggable));
      }

      if (onDragStart) {
        const handler = function (event: DragEvent) {
          if (onDragStart) onDragStart(event);
        };
        methods.listen($elm, "dragstart", handler);
      }

      if (onDrag) {
        const handler = function (event: DragEvent) {
          if (onDrag) onDrag(event);
        };
        methods.listen($elm, "drag", handler);
      }

      if (onDragEnd) {
        const handler = function (event: DragEvent) {
          if (onDragEnd) onDragEnd(event);
        };
        methods.listen($elm, "dragend", handler);
      }

      if (onDragEnter) {
        const handler = function (event: DragEvent) {
          if (onDragEnter) onDragEnter(event);
        };
        methods.listen($elm, "dragenter", handler);
      }

      if (onDragOver) {
        const handler = function (event: DragEvent) {
          if (onDragOver) onDragOver(event);
        };
        methods.listen($elm, "dragover", handler);
      }

      if (onDragLeave) {
        const handler = function (event: DragEvent) {
          if (onDragLeave) onDragLeave(event);
        };
        methods.listen($elm, "dragleave", handler);
      }

      if (onDrop) {
        const handler = function (event: DragEvent) {
          if (onDrop) onDrop(event);
        };
        methods.listen($elm, "drop", handler);
      }

      if (onAnimationEnd) {
        const handler = function (event: AnimationEvent) {
          if (onAnimationEnd) {
            onAnimationEnd(event);
          }
        };
        methods.listen($elm, "animationend", handler);
      }
    },
  };
  const lifecycle = {
    handleMounted() {},
    handleBeforeUnmount() {},
    handleUnmounted() {},
  };

  methods.setup_children(children);
  methods.setup_value_subscribe();

  return {
    t: "view",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    value: "",
    children: state.children,
    props: state.props,
    attributes: state.attributes,
    events: state.events,
    /** @deprecated */
    render() {
      if (state.rendered) {
        return $elm;
      }
      state.rendered = true;
      // Create element if not already created
      methods.setup_children(children);
      methods.setup_value_subscribe();

      if (onMounted) {
        manager$.push(onMounted({ target: $elm }));
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
      methods.setup_children();
      methods.setup_value_subscribe();

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
        manager$.push(onMounted({ target: $elm }));
      }

      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.onMounted) {
          node.onMounted({ target: node.$elm });
        }
      }

      return $elm;
    },
    onMounted(event: MountedEvent) {
      // console.log("the view mounted", event.target);
      if (onMounted) {
        onMounted(event);
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (beforeUnmounted) {
        beforeUnmounted();
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
      if (onUnmounted) {
        // console.log("[View] calling props.onUnmounted");
        onUnmounted();
      }
      manager$.clean();
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
