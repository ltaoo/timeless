import { isRef } from "@timeless/reactive";

import { ViewChildren, isElement } from "./view";

export function Switch(
  props: {
    fallback?: ViewChildren;
    onMounted?: ($fg: any) => void;
    beforeUnmounted?: () => void;
    onUnmounted?: () => void;
  },
  children?: any[],
) {
  const { fallback, onMounted, beforeUnmounted, onUnmounted } = props;
  const anchor = document.createTextNode("");

  let _currentNodes: Node[] = [];
  let _currentChildren: any[] = [];
  let _prev_match: any = undefined;

  // Normalize children helper
  const normalize = (c: any) => {
    if (Array.isArray(c)) return c;
    return [c];
  };

  const _fallback = normalize(fallback);

  const getActiveMatch = () => {
    if (!children) return null;
    for (const child of children) {
      if (child && child.t === "match") {
        const condition = isRef(child.when) ? !!child.when.value : !!child.when;
        if (condition) return child;
      }
    }
    return null;
  };

  const getTargetChildren = (match: any) => {
    return match ? normalize(match.children) : _fallback;
  };

  const unmount = (removeDom = false) => {
    // Lifecycle
    for (const child of _currentChildren) {
      if (isElement(child) && child.onUnmounted) {
        child.onUnmounted();
      }
    }
    // DOM removal
    const parent = anchor.parentNode;
    if (removeDom && parent) {
      for (const node of _currentNodes) {
        if (node.parentNode === parent) {
          parent.removeChild(node);
        }
      }
    }
    _currentNodes = [];
    _currentChildren = [];
  };

  const mount = (targetChildren: any[], parent?: Node, before?: Node) => {
    const fragment = document.createDocumentFragment();
    const newNodes: Node[] = [];
    const newInstances: any[] = [];

    for (const node of targetChildren) {
      if (!node) continue;
      if (isElement(node)) {
        const result = node.render();
        if (result) {
          if (result instanceof DocumentFragment) {
            newNodes.push(...Array.from(result.childNodes));
            fragment.appendChild(result);
          } else {
            newNodes.push(result);
            fragment.appendChild(result);
          }
          newInstances.push(node);
        }
      } else if (typeof node === "string" || typeof node === "number") {
        const textNode = document.createTextNode(String(node));
        fragment.appendChild(textNode);
        newNodes.push(textNode);
      }
    }

    _currentNodes = newNodes;
    _currentChildren = newInstances;

    if (parent) {
      parent.insertBefore(fragment, before || null);
    }

    // Lifecycle
    for (const child of newInstances) {
      if (isElement(child) && child.onMounted) {
        child.onMounted(child.$elm);
      }
    }

    return fragment;
  };

  const update = () => {
    const activeMatch = getActiveMatch();
    if (activeMatch === _prev_match) return;
    _prev_match = activeMatch;

    unmount(true);
    const target = getTargetChildren(activeMatch);
    if (target.length > 0 && anchor.parentNode) {
      mount(target, anchor.parentNode, anchor);
    }
  };

  if (children) {
    for (const child of children) {
      if (child && child.t === "match" && isRef(child.when)) {
        child.when._subscribe({
          onChange: update,
        });
      }
    }
  }

  return {
    t: "switch",
    $elm: anchor as any,
    render() {
      const activeMatch = getActiveMatch();
      _prev_match = activeMatch;

      const target = getTargetChildren(activeMatch);
      const fragment = mount(target);

      // Append anchor to the result fragment so it gets inserted into DOM
      fragment.appendChild(anchor);

      if (onMounted) {
        onMounted(anchor);
      }
      return fragment;
    },
    beforeUnmounted() {
      if (beforeUnmounted) beforeUnmounted();
      for (const child of _currentChildren) {
        if (isElement(child) && child.beforeUnmounted) {
          child.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      if (onUnmounted) onUnmounted();
      unmount(false);
    },
  };
}
