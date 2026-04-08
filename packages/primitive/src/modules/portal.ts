import { isRef } from "@timeless/reactive";

import { ViewProps } from "@/content/view";
import { TimelessElement, ViewChildren, isElement } from "@/content/type";
import { Txt } from "@/content/text";
import { MountedEvent } from "@/event";

export function Portal(props: ViewProps & {}, children?: ViewChildren) {
  let $elm: any = null;

  const normalize = (c: any) => {
    if (Array.isArray(c)) return c;
    return [c];
  };

  // const _children = normalize(children);

  const methods = {
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
          if (isRef(child)) {
            state.children[i] = Txt(child);
            return;
          }
          if (typeof child === "string") {
            state.children[i] = Txt(String(child));
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
    cleanup() {
      console.log(
        "[Portal] cleanup called, _mountedNodes:",
        // _mounted_children.length,
        "_mountedChildren:",
        // _mountedChildren.length,
      );
      // Lifecycle - 先调用 beforeUnmounted
      for (const child of _mountedChildren) {
        if (isElement(child) && child.beforeUnmounted) {
          console.log("[Portal] calling beforeUnmounted on child:", child.t);
          child.beforeUnmounted();
        }
      }
      // Lifecycle - 再调用 cleanup 或 onUnmounted
      for (const child of _mountedChildren) {
        if (isElement(child)) {
          // 如果子组件有 cleanup 方法，优先调用
          if (typeof child.cleanup === "function") {
            console.log("[Portal] calling cleanup on child:", child.t);
            child.cleanup();
          } else if (child.onUnmounted) {
            console.log("[Portal] calling onUnmounted on child:", child.t);
            child.onUnmounted();
          }
        }
      }

      // Remove DOM nodes
      console.log(
        "[Portal] removing DOM nodes, count:",
        _mounted_children.length,
      );

      $elm.removeContent();
      // for (const child of _mounted_children) {
      //   console.log(
      //     "[Portal] checking node:",
      //     child.nodeName,
      //     "parentNode:",
      //     !!child.parentNode,
      //   );
      //   // const parent = host.getParentNode(child);
      //   const $parent = child.getParentNode();
      //   if ($parent) {
      //     $parent.removeChild($child);
      //   }
      // }

      _mounted_children = [];
      _mountedChildren = [];
      _mounted = false;

      if (props.onUnmounted) {
        console.log("[Portal] calling props.onUnmounted");
        props.onUnmounted();
      }
      console.log("[Portal] cleanup completed");
    },
  };

  let _mounted_children: Node[] = [];
  let _mountedChildren: any[] = [];
  let _mounted = false;
  const state: {
    children: TimelessElement[];
  } = {
    children: [],
  };
  methods.setup_children(children);

  return {
    t: "portal",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    children: state.children,
    render() {
      if (_mounted) {
        return null;
      }

      // Create anchor if not already created
      // if (!anchor) {
      //   anchor = safeCreateTextNode("");
      // }

      // const fragment = safeCreateDocumentFragment();
      const nodes: any[] = [];
      const instances: any[] = [];

      // console.log("[Portal] render, children count:", _children.length);

      _mounted = true;

      // console.log("[Portal] appending to body, nodes count:", nodes.length);
      // const body = host.getBody?.();
      // if (body) host.appendChild(body, fragment);

      // Lifecycle

      return null;
    },
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted({ target: event.target });
      }
      for (const child of state.children) {
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    onUnmounted() {
      methods.cleanup();
    },
  };
}
