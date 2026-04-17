import { isRef } from "@timeless/reactive";

import { Text } from "@/content/text";
import { isElement, ViewChildren, resolve_children } from "@/content/type";
import { MountedEvent } from "@/event/index";
import { Box, BoxProps } from "@/content/box";
import { ListenerManager } from "@/util/listener";

export type ButtonProps = BoxProps & {};
type ButtonState = {};

export function Button(props: ButtonProps = {}, children?: ViewChildren) {
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

  let $elm: any = null;
  const box$ = Box<ButtonState>(props, {});
  const listener$ = ListenerManager();
  const state = box$.state;
  const events = {
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
  };

  const methods = {
    // Helper: normalize children (convert functions, wrap refs)
    normalize_children(children?: ViewChildren) {
      const resolved = resolve_children(children);
      if (!resolved) {
        return;
      }
      for (let i = 0; i < resolved.length; i++) {
        const child = resolved[i];
        // console.log("for children", child);
        (() => {
          // if (typeof child === "function") {
          //   const r = child();
          //   state.children[i] = r;
          //   return;
          // }
          if (isRef(child)) {
            state.children[i] = Text(child);
            return;
          }
          if (typeof child === "string") {
            state.children[i] = Text(String(child));
            return;
          }
          if (isElement(child)) {
            state.children[i] = child;
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
  };
  const lifecycle = {
    handleMounted() {},
    handleBeforeUnmount() {},
    handleUnmounted() {},
  };

  methods.normalize_children(children);
  box$.methods.subscribe_props();

  return {
    t: "button",
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
    // hydrate(existingDom: any) {
    //   // if (state.rendered) {
    //   //   return $elm;
    //   // }
    //   // state.rendered = true;

    //   // $elm = existingDom;
    //   // methods.normalize_children();
    //   // methods.setup_reactive_props_bindings();

    //   // // Hydrate children recursively
    //   // // let childDom = host.getFirstChild($elm);
    //   // let childDom = $elm.getFirstChild();
    //   // for (let i = 0; i < state.children.length; i += 1) {
    //   //   const node = state.children[i];
    //   //   if (!node) continue;

    //   //   if (typeof node === "string" || typeof node === "number") {
    //   //     // Skip text nodes
    //   //     if (childDom) {
    //   //       // childDom = host.getNextSibling(childDom);
    //   //       childDom = childDom.getNextSibling();
    //   //     }
    //   //     continue;
    //   //   }

    //   //   if (isElement(node)) {
    //   //     if (typeof (node as any).hydrate === "function") {
    //   //       // 传递 $elm 作为 parentDom，即使 childDom 为 null 也要调用 hydrate
    //   //       (node as any).hydrate(childDom, $elm);
    //   //       if (childDom) {
    //   //         // childDom = host.getNextSibling(node.$elm || childDom);
    //   //         // if (node.$elm) {
    //   //         //   childDom = node.$elm.getNextSibling();
    //   //         // } else if (childDom) {
    //   //         //   childDom = childDom.getNextSibling();
    //   //         // }
    //   //       }
    //   //     } else if (childDom) {
    //   //       // Fallback: just assign $elm and setup
    //   //       node.$elm = childDom;
    //   //       // node.render();
    //   //       // childDom = host.getNextSibling(childDom);
    //   //       childDom = childDom.getNextSibling();
    //   //     } else {
    //   //       // childDom 为 null 时，直接 render 并插入
    //   //       // const result = node.render();
    //   //       // if (result) {
    //   //       //   // host.appendChild($elm, result);
    //   //       //   $elm.appendChild(result);
    //   //       // }
    //   //     }
    //   //   }
    //   // }

    //   // if (onMounted) {
    //   //   const cleanup = onMounted({ target: $elm });
    //   //   if (typeof cleanup === "function") {
    //   //     onMountedCleanup = cleanup;
    //   //   }
    //   // }

    //   // for (let i = 0; i < state.children.length; i += 1) {
    //   //   const node = state.children[i];
    //   //   if (isElement(node) && node.onMounted) {
    //   //     node.onMounted({ target: node.$elm });
    //   //   }
    //   // }

    //   return $elm;
    // },
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
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
      // console.log(
      //   "[View] onUnmounted called, children count:",
      //   _children.length,
      // );
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      // for (let i = 0; i < state.children.length; i += 1) {
      //   const node = state.children[i];
      //   if (isElement(node)) {
      //     // 如果是 Portal 组件，调用其 cleanup 方法
      //     if (node.t === "portal" && typeof node.cleanup === "function") {
      //       // console.log("[View] calling cleanup on Portal child");
      //       node.cleanup();
      //     } else if (node.onUnmounted) {
      //       // 否则调用标准的 onUnmounted
      //       // console.log("[View] calling onUnmounted on child:", node.t);
      //       node.onUnmounted();
      //     }
      //   }
      // }
      // console.log("[View] clearing DOM, firstChild:", !!$elm.firstChild);
      // host.clearChildren($elm);
      // $elm.removeChildren();
      // console.log("[View] onUnmounted completed");

      // Reset state for potential re-render (e.g., when Show toggles when back to true)
      state.rendered = false;
      $elm = null;
    },
  };
}
