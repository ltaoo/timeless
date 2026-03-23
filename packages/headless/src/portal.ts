import { ViewChildren, ViewProps, isElement } from "./view";
import { isBrowser, safeCreateTextNode, safeCreateDocumentFragment } from "./env";

export function Portal(props: ViewProps & {}, children: ViewChildren) {
  const anchor = safeCreateTextNode("");
  let _mountedNodes: Node[] = [];
  let _mountedChildren: any[] = [];
  let _mounted = false;

  const normalize = (c: any) => {
    if (Array.isArray(c)) return c;
    return [c];
  };

  const _children = normalize(children);

  const cleanup = () => {
    console.log(
      "[Portal] cleanup called, _mountedNodes:",
      _mountedNodes.length,
      "_mountedChildren:",
      _mountedChildren.length,
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
    console.log("[Portal] removing DOM nodes, count:", _mountedNodes.length);
    for (const node of _mountedNodes) {
      console.log(
        "[Portal] checking node:",
        node.nodeName,
        "parentNode:",
        !!node.parentNode,
      );
      if (node.parentNode) {
        console.log("[Portal] removing node from parent");
        node.parentNode.removeChild(node);
      }
    }

    _mountedNodes = [];
    _mountedChildren = [];
    _mounted = false;

    if (props.onUnmounted) {
      console.log("[Portal] calling props.onUnmounted");
      props.onUnmounted();
    }
    console.log("[Portal] cleanup completed");
  };

  return {
    t: "portal",
    $elm: anchor as any,
    cleanup,
    render() {
      if (_mounted) {
        return null;
      }
      const fragment = safeCreateDocumentFragment();
      const nodes: Node[] = [];
      const instances: any[] = [];

      // console.log("[Portal] render, children count:", _children.length);

      for (let child of _children) {
        if (!child) continue;
        // Handle lazy functions from h()
        if (typeof child === "function") {
          child = child();
        }
        if (!child) continue;
        if (isElement(child)) {
          const result = child.render();
          if (result) {
            if (result instanceof DocumentFragment) {
              nodes.push(...Array.from(result.childNodes));
              fragment.appendChild(result);
            } else {
              nodes.push(result);
              fragment.appendChild(result);
            }
            instances.push(child);
          }
        } else if (typeof child === "string" || typeof child === "number") {
          const textNode = safeCreateTextNode(String(child));
          fragment.appendChild(textNode);
          nodes.push(textNode);
        }
      }

      _mountedNodes = nodes;
      _mountedChildren = instances;
      _mounted = true;

      // console.log("[Portal] appending to body, nodes count:", nodes.length);
      if (isBrowser) {
        document.body.appendChild(fragment);
      }

      // Lifecycle
      for (const child of instances) {
        if (isElement(child) && child.onMounted) {
          child.onMounted(child.$elm);
        }
      }

      if (props.onMounted) {
        props.onMounted(anchor);
      }

      return null;
    },
    onUnmounted() {
      cleanup();
    },
  };
}
