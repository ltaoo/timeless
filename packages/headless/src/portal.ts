import { ViewChildren, ViewProps, isElement } from "./view";

export function Portal(props: ViewProps & {}, children: ViewChildren) {
  const anchor = document.createTextNode("");
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
      "[Portal] cleanup, cleaning up",
      _mountedNodes.length,
      "nodes",
    );
    // Lifecycle
    for (const child of _mountedChildren) {
      if (isElement(child) && child.onUnmounted) {
        child.onUnmounted();
      }
    }

    // Remove DOM nodes
    for (const node of _mountedNodes) {
      console.log(
        "[Portal] removing node:",
        node.nodeName,
        "parentNode:",
        !!node.parentNode,
      );
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }

    _mountedNodes = [];
    _mountedChildren = [];
    _mounted = false;

    if (props.onUnmounted) {
      props.onUnmounted();
    }
  };

  return {
    t: "portal",
    $elm: anchor as any,
    cleanup,
    render() {
      if (_mounted) {
        return;
      }
      const fragment = document.createDocumentFragment();
      const nodes: Node[] = [];
      const instances: any[] = [];

      console.log("[Portal] render, children count:", _children.length);

      for (const child of _children) {
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
          const textNode = document.createTextNode(String(child));
          fragment.appendChild(textNode);
          nodes.push(textNode);
        }
      }

      _mountedNodes = nodes;
      _mountedChildren = instances;
      _mounted = true;

      console.log("[Portal] appending to body, nodes count:", nodes.length);
      document.body.appendChild(fragment);

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
