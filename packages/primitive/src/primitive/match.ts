import { isRef, Ref } from "@timeless/reactive";

import { getHost } from "@/host";
import { safeCreateDocumentFragment, safeCreateTextNode } from "@/util/env";

import { ViewChildren, isElement, TimelessElement } from "./view";

export function Match(
  props: {
    when: Ref<any> | any;
    fallback?: ViewChildren;
    onMounted?: ($fg: any) => void;
    beforeUnmounted?: () => void;
    onUnmounted?: () => void;
  },
  children?: ViewChildren,
) {
  const { when, fallback, onMounted, beforeUnmounted, onUnmounted } = props;
  const host = getHost();
  let anchor: any = null;

  let _currentNodes: any[] = [];
  let _currentChildren: any[] = [];
  let _prev_value: any = undefined;

  function normalize(c: any) {
    if (Array.isArray(c)) return c;
    return [c];
  }

  const _fallback = normalize(fallback);

  function get_active_match() {
    if (!children) {
      return null;
    }
    const when_value = isRef(when) ? when.value : when;
    console.log("[Switch] when_value:", when_value, "children:", children);
    for (const child of children) {
      if (isElement(child) && child.t === "case") {
        if (child.value === when_value) {
          console.log("[Switch] MATCHED!");
          return child;
        }
      }
    }
    return null;
  }

  function get_target_children(match: any) {
    if (!match) return _fallback;
    let children = match.children;

    if (Array.isArray(children)) {
      children = children.map((child: any) =>
        typeof child === "function" ? child() : child,
      );
      return normalize(children);
    }

    if (typeof children === "function") {
      return normalize(children());
    }

    return normalize(children);
  }

  function unmount(removeDom = false) {
    for (const child of _currentChildren) {
      if (isElement(child) && child.onUnmounted) {
        child.onUnmounted();
      }
    }
    const parent = host.getParentNode(anchor);
    if (removeDom && parent) {
      for (const node of _currentNodes) {
        if (host.getParentNode(node) === parent) {
          host.removeChild(parent, node);
        }
      }
    }
    _currentNodes = [];
    _currentChildren = [];
  }

  function mount(targetChildren: any[], parent?: any, before?: any) {
    const fragment = safeCreateDocumentFragment();
    const newNodes: any[] = [];
    const newInstances: any[] = [];

    for (const node of targetChildren) {
      if (!node) continue;
      if (isElement(node)) {
        const result = node.render();
        if (result) {
          if (host.isDocumentFragment(result)) {
            newNodes.push(...host.getChildNodes(result));
          } else {
            newNodes.push(result);
          }
          host.appendChild(fragment, result);
          newInstances.push(node);
        }
      } else if (typeof node === "string" || typeof node === "number") {
        const textNode = safeCreateTextNode(String(node));
        host.appendChild(fragment, textNode);
        newNodes.push(textNode);
      }
    }

    _currentNodes = newNodes;
    _currentChildren = newInstances;

    if (parent) {
      host.insertBefore(parent, fragment, before || null);
    }

    for (const child of newInstances) {
      if (isElement(child) && child.onMounted) {
        child.onMounted({ target: child.$elm });
      }
    }

    return fragment;
  }

  function update() {
    const whenValue = isRef(when) ? when.value : when;
    if (whenValue === _prev_value) return;
    _prev_value = whenValue;

    unmount(true);
    const activeMatch = get_active_match();
    const target = get_target_children(activeMatch);
    const parent = host.getParentNode(anchor);
    if (target.length > 0 && parent) {
      mount(target, parent, anchor);
    }
  }

  if (isRef(when)) {
    when._subscribe({
      onChange: update,
    });
  }

  return {
    t: "match",
    $elm: anchor as any,
    render() {
      const when_value = isRef(when) ? when.value : when;
      _prev_value = when_value;

      // Create anchor if not already created
      if (!anchor) {
        anchor = safeCreateTextNode("");
      }

      const active_match = get_active_match();
      const target = get_target_children(active_match);
      const fragment = mount(target);

      host.appendChild(fragment, anchor);

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

export function Case<T = any>(
  value: any,
  children: ViewChildren | (() => TimelessElement)[],
) {
  return {
    t: "case",
    value,
    children,
    $elm: safeCreateDocumentFragment() as any,
    render() {
      return null;
    },
  };
}
