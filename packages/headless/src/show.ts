import { isRef, Ref } from "@timeless/reactive";

import { ViewChildren, isElement } from "./view";

export function Show(
  propsOrWhen:
    | {
        when: Ref<boolean | undefined | null> | boolean;
        fallback?: ViewChildren;
        onMounted?: ($fg: any) => void;
        beforeUnmounted?: () => void;
        onUnmounted?: () => void;
      }
    | Ref<boolean | undefined | null>
    | boolean,
  children?: ViewChildren,
) {
  // 支持两种调用方式：
  // 1. Show({ when, fallback }, children)
  // 2. Show(condition, children)
  const isObjectProps =
    typeof propsOrWhen === "object" &&
    propsOrWhen !== null &&
    "when" in propsOrWhen;

  const when = isObjectProps ? propsOrWhen.when : propsOrWhen;
  const fallback = isObjectProps ? propsOrWhen.fallback : undefined;
  const onMounted = isObjectProps ? propsOrWhen.onMounted : undefined;
  const beforeUnmounted = isObjectProps
    ? propsOrWhen.beforeUnmounted
    : undefined;
  const onUnmounted = isObjectProps ? propsOrWhen.onUnmounted : undefined;
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

  const unmount = (removeDom = false) => {
    console.log(
      "[Show] unmount called, removeDom:",
      removeDom,
      "_currentChildren:",
      _currentChildren.length,
      "_currentNodes:",
      _currentNodes.length,
    );

    // Lifecycle - 先调用 beforeUnmounted
    for (const child of _currentChildren) {
      if (isElement(child) && child.beforeUnmounted) {
        console.log("[Show] calling beforeUnmounted on child:", child.t);
        child.beforeUnmounted();
      }
    }
    // Lifecycle - 对于 Portal 组件，调用 cleanup 方法
    for (const child of _currentChildren) {
      if (isElement(child)) {
        // 如果是 Portal 组件，调用其 cleanup 方法
        if (child.t === "portal" && typeof child.cleanup === "function") {
          console.log("[Show] calling cleanup on Portal child");
          child.cleanup();
        } else if (child.onUnmounted) {
          // 否则调用标准的 onUnmounted
          console.log("[Show] calling onUnmounted on child:", child.t);
          child.onUnmounted();
        }
      }
    }
    // DOM removal
    if (removeDom) {
      console.log("[Show] removing DOM nodes, count:", _currentNodes.length);
      for (const node of _currentNodes) {
        // 直接检查节点是否还有父节点，不依赖 anchor.parentNode
        console.log(
          "[Show] checking node:",
          node.nodeName,
          "parentNode:",
          !!node.parentNode,
        );
        if (node.parentNode) {
          console.log("[Show] removing node from parent");
          node.parentNode.removeChild(node);
        }
      }
    }
    _currentNodes = [];
    _currentChildren = [];
    console.log("[Show] unmount completed");
  };

  const mount = (targetChildren: any[], parent?: Node, before?: Node) => {
    const fragment = document.createDocumentFragment();
    const newNodes: Node[] = [];
    const newInstances: any[] = [];

    for (let node of targetChildren) {
      if (!node) continue;
      // 处理 h() 返回的延迟执行函数
      if (typeof node === "function") {
        node = node();
      }
      if (isElement(node)) {
        const result = node.render();
        // 即使 render 返回 null（如 Portal），也要保存实例以便调用生命周期
        newInstances.push(node);
        if (result) {
          if (result instanceof DocumentFragment) {
            newNodes.push(...Array.from(result.childNodes));
            fragment.appendChild(result);
          } else {
            newNodes.push(result);
            fragment.appendChild(result);
          }
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
        console.log(
          "[]Show onChange",
          condition,
          "_prev_condition:",
          _prev_condition,
          "_currentNodes.length:",
          _currentNodes.length,
          "anchor.parentNode:",
          !!anchor.parentNode,
        );

        // 如果条件没有变化，直接返回
        if (condition === _prev_condition) {
          console.log("[]Show condition not changed, skip");
          return;
        }

        _prev_condition = condition;

        // 先卸载当前内容
        unmount(true);

        // 如果新条件为 true，挂载新内容
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
    cleanup() {
      console.log("[Show] cleanup called");
      // 清理当前挂载的所有内容
      unmount(true);
    },
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
      unmount(false);
    },
  };
}
