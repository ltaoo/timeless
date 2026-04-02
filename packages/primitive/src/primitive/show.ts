import { isRef, Ref } from "@timeless/reactive";

import { safeCreateTextNode, safeCreateDocumentFragment } from "@/util/env";
import { getHost } from "@/host";

import { ViewChildren, isElement } from "./view";

export function Show(
  props: {
    when: Ref<boolean> | Ref<boolean | undefined | null> | boolean;
    fallback?: ViewChildren;
    onMounted?: ($fg: any) => void;
    beforeUnmounted?: () => void;
    onUnmounted?: () => void;
  },
  children: ViewChildren = [],
) {
  const host = getHost();
  // 支持两种调用方式：
  // 1. Show({ when, fallback }, children)
  // 2. Show(condition, children)
  const isObjectProps =
    typeof props === "object" && props !== null && "when" in props;

  const when = isObjectProps ? props.when : props;
  const fallback = isObjectProps ? props.fallback : undefined;
  const onMounted = isObjectProps ? props.onMounted : undefined;
  const beforeUnmounted = isObjectProps ? props.beforeUnmounted : undefined;
  const onUnmounted = isObjectProps ? props.onUnmounted : undefined;
  let anchor: any = null;

  let _current_nodes: any[] = [];
  let _current_children: any[] = [];
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

  const unmount = (
    event: Partial<{ reason: string; removeDom: boolean }> = {
      removeDom: false,
    },
  ) => {
    // console.log(
    //   "[Show] unmount called, removeDom:",
    //   event.removeDom,
    //   "_currentChildren:",
    //   _current_children.length,
    //   "_currentNodes:",
    //   _current_nodes.length,
    // );

    // Lifecycle - 先调用 beforeUnmounted
    for (const child of _current_children) {
      if (isElement(child) && child.beforeUnmounted) {
        // console.log("[Show] calling beforeUnmounted on child:", child.t);
        child.beforeUnmounted();
      }
    }
    // Lifecycle - 对于 Portal 组件，调用 cleanup 方法
    for (const child of _current_children) {
      if (isElement(child)) {
        // 如果是 Portal 组件，调用其 cleanup 方法
        if (child.t === "portal" && typeof child.cleanup === "function") {
          // console.log("[Show] calling cleanup on Portal child");
          child.cleanup();
        } else if (child.onUnmounted) {
          // 否则调用标准的 onUnmounted
          // console.log("[Show] calling onUnmounted on child:", child.t);
          child.onUnmounted();
        }
      }
    }
    // DOM removal
    if (event.removeDom) {
      // console.log("[Show] removing DOM nodes, count:", _current_nodes.length);
      for (const node of _current_nodes) {
        // 直接检查节点是否还有父节点，不依赖 anchor.parentNode
        // console.log(
        //   "[Show] checking node:",
        //   node.nodeName,
        //   "parentNode:",
        //   !!node.parentNode,
        // );
        const parent = host.getParentNode(node);
        if (parent) {
          host.removeChild(parent, node);
        }
      }
    }
    _current_nodes = [];
    _current_children = [];
    console.log("[Show] unmount completed");
  };

  const mount = (targetChildren: any[], parent?: any, before?: any) => {
    const fragment = safeCreateDocumentFragment();
    const newNodes: any[] = [];
    const newInstances: any[] = [];

    for (let node of targetChildren) {
      // 跳过 null/undefined，但不跳过空字符串和 0
      if (node === null || node === undefined) continue;
      // 处理 h() 返回的延迟执行函数
      if (typeof node === "function") {
        node = node();
      }
      if (isElement(node)) {
        const result = node.render();
        // 即使 render 返回 null（如 Portal），也要保存实例以便调用生命周期
        newInstances.push(node);
        if (result) {
          if (host.isDocumentFragment(result)) {
            newNodes.push(...host.getChildNodes(result));
          } else {
            newNodes.push(result);
          }
          host.appendChild(fragment, result);
        }
      } else if (typeof node === "string" || typeof node === "number") {
        const textNode = safeCreateTextNode(String(node));
        host.appendChild(fragment, textNode);
        newNodes.push(textNode);
      }
    }

    _current_nodes = newNodes;
    _current_children = newInstances;

    if (parent) {
      host.insertBefore(parent, fragment, before || null);
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
      onChange(value) {
        const condition = !!value;
        // console.log(
        //   "[]Show onChange",
        //   condition,
        //   "_prev_condition:",
        //   _prev_condition,
        //   "_currentNodes.length:",
        //   _current_nodes.length,
        //   "anchor.parentNode:",
        //   !!anchor.parentNode,
        // );

        // 如果条件没有变化，直接返回
        if (condition === _prev_condition) {
          console.log("[]Show condition not changed, skip");
          return;
        }

        _prev_condition = condition;

        // 先卸载当前内容
        unmount({ reason: "handle when value change", removeDom: true });

        // 如果新条件为 true，挂载新内容
        const target = getTargetChildren(condition);
        const parent = host.getParentNode(anchor);
        if (target.length > 0 && parent) {
          mount(target, parent, anchor);
        }
      },
    });
  }

  return {
    t: "show",
    get $elm() {
      return anchor;
    },
    set $elm(v) {
      anchor = v;
    },
    _props: { when, fallback },
    _children,
    _fallback,
    cleanup() {
      // console.log("[Show] cleanup called");
      // 清理当前挂载的所有内容
      unmount({
        reason: "call cleanup",
        removeDom: true,
      });
    },
    render() {
      const condition = isRef(when) ? !!when.value : !!when;
      _prev_condition = condition;

      // Create anchor if not already created
      if (!anchor) {
        anchor = safeCreateTextNode("");
      }

      const target = getTargetChildren(condition);
      const fragment = mount(target);

      // Append anchor to the result fragment so it gets inserted into DOM
      host.appendChild(fragment, anchor);

      if (onMounted) {
        onMounted(anchor);
      }
      return fragment;
    },
    hydrate(startDom: any, parentDom?: any) {
      const condition = isRef(when) ? !!when.value : !!when;
      _prev_condition = condition;

      // Create anchor if not already created
      if (!anchor) {
        anchor = safeCreateTextNode("");
      }

      const targetChildren = getTargetChildren(condition);
      let currentDom = startDom;
      const newNodes: any[] = [];
      const newInstances: any[] = [];

      for (let node of targetChildren) {
        // 跳过 null/undefined，但不跳过空字符串和 0
        if (node === null || node === undefined) continue;
        if (typeof node === "function") {
          node = node();
        }

        if (isElement(node)) {
          newInstances.push(node);
          if (currentDom && typeof (node as any).hydrate === "function") {
            (node as any).hydrate(currentDom, parentDom);
            newNodes.push(node.$elm);
            currentDom = host.getNextSibling(node.$elm || currentDom);
          } else if (currentDom) {
            node.$elm = currentDom;
            node.render();
            newNodes.push(node.$elm);
            currentDom = host.getNextSibling(currentDom);
          }
        } else if (typeof node === "string" || typeof node === "number") {
          if (currentDom) {
            newNodes.push(currentDom);
            currentDom = host.getNextSibling(currentDom);
          }
        }
      }

      _current_nodes = newNodes;
      _current_children = newInstances;

      // Insert anchor after the content
      // 优先使用 parentDom，其次从 startDom 获取，最后从已插入的节点获取
      const $parent =
        parentDom ||
        (startDom ? host.getParentNode(startDom) : null) ||
        (newNodes.length > 0 ? host.getParentNode(newNodes[0]) : null);
      if ($parent) {
        if (currentDom) {
          host.insertBefore($parent, anchor, currentDom);
        } else {
          host.appendChild($parent, anchor);
        }
      }

      if (onMounted) {
        onMounted(anchor);
      }

      // Call onMounted for children
      for (const child of newInstances) {
        if (isElement(child) && child.onMounted) {
          child.onMounted(child.$elm);
        }
      }

      return anchor;
    },
    beforeUnmounted() {
      if (beforeUnmounted) beforeUnmounted();
      for (const child of _current_children) {
        if (isElement(child) && child.beforeUnmounted) {
          child.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      if (onUnmounted) {
        onUnmounted();
      }
      unmount({
        reason: "onUnmounted handler",
        removeDom: true,
      });
    },
  };
}
