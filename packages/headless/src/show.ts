import { isRef, Ref } from "@timeless/reactive";

import { ViewChildren, isElement } from "./view";

export function Show(
  props: {
    when: Ref<boolean> | boolean;
    fallback?: ViewChildren;
    onMounted?: ($fg: any) => void;
    beforeUnmounted?: () => void;
    onUnmounted?: () => void;
    [key: string]: any;
  },
  children?: ViewChildren,
) {
  const { when, fallback, onMounted, beforeUnmounted, onUnmounted } = props;
  const anchor = document.createTextNode("");
  
  let _currentNodes: Node[] = [];
  let _currentChildren: any[] = [];
  let _prev_condition: boolean | null = null;

  // Normalize children helper
  const normalize = (c: any) => {
    if (Array.isArray(c)) return c;
    return [c];
  };

  const _children = normalize(children);
  const _fallback = normalize(fallback);

  const getTargetChildren = (condition: boolean) => {
    return condition ? _children : _fallback;
  };

  const unmount = () => {
    // Lifecycle
    for (const child of _currentChildren) {
      if (isElement(child) && child.onUnmounted) {
        child.onUnmounted();
      }
    }
    // DOM removal
    const parent = anchor.parentNode;
    if (parent) {
      for (const node of _currentNodes) {
        parent.removeChild(node);
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
          fragment.appendChild(result);
          newNodes.push(result);
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

  if (isRef(when)) {
    when._subscribe({
      onChange(value: boolean) {
        const condition = !!value;
        if (condition === _prev_condition) return;
        _prev_condition = condition;

        unmount();
        const target = getTargetChildren(condition);
        if (target.length > 0 && anchor.parentNode) {
            mount(target, anchor.parentNode, anchor);
        }
      },
    });
  }

  return {
    t: "show",
    $elm: anchor as any,
    render() {
      const condition = isRef(when) ? !!when.value : !!when;
      _prev_condition = condition;
      
      const target = getTargetChildren(condition);
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
      unmount();
    },
  };
}
