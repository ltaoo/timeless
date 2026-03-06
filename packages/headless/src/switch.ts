import { isRef, Ref } from "@timeless/reactive";

import {
  ViewProps,
  ViewChildren,
  isElement,
  TimelessElement,
  TimelessComponent,
  TimelessNormalComponent,
} from "./view";

export function Switch(
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
  const anchor = document.createTextNode("");

  let _currentNodes: Node[] = [];
  let _currentChildren: any[] = [];
  let _prev_value: any = undefined;

  // Normalize children helper
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
      if (isElement(child) && child.t === "match") {
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

    // 如果 children 是数组，检查数组内的元素
    if (Array.isArray(children)) {
      // 展开数组中的函数
      children = children.map((child: any) =>
        typeof child === "function" ? child() : child,
      );
      return normalize(children);
    }

    // 如果 children 是函数，调用它来获取实际的子元素
    if (typeof children === "function") {
      return normalize(children());
    }

    return normalize(children);
  }

  function unmount(removeDom = false) {
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
  }

  function mount(targetChildren: any[], parent?: Node, before?: Node) {
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
  }

  function update() {
    const whenValue = isRef(when) ? when.value : when;
    if (whenValue === _prev_value) return;
    _prev_value = whenValue;

    unmount(true);
    const activeMatch = get_active_match();
    const target = get_target_children(activeMatch);
    if (target.length > 0 && anchor.parentNode) {
      mount(target, anchor.parentNode, anchor);
    }
  }

  if (isRef(when)) {
    when._subscribe({
      onChange: update,
    });
  }

  return {
    t: "switch",
    $elm: anchor as any,
    render() {
      const when_value = isRef(when) ? when.value : when;
      _prev_value = when_value;

      const active_match = get_active_match();
      const target = get_target_children(active_match);
      const fragment = mount(target);

      // console.log(
      //   "[]Switch find matched Match",
      //   when_value,
      //   active_match,
      //   target,
      // );

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

export function Match<T = any>(
  value: any,
  children: ViewChildren | (() => TimelessElement)[],
) {
  return {
    t: "match",
    value,
    children,
    // 用来给 Switch 满足 isElement(child) 判断
    $elm: document.createDocumentFragment() as any,
    render() {
      return null;
    },
  };
}

