import { isRef, Ref } from "@timeless/reactive";

import { ViewChildren, isElement, TimelessElement } from "@/content/view";
import { safeCreateTextNode } from "@/util/env";

export function Match(
  props: {
    when: Ref<any> | any;
    fallback?: () => ViewChildren;
    onMounted?: ($fg: any) => void;
    beforeUnmounted?: () => void;
    onUnmounted?: () => void;
  },
  children?: ViewChildren,
) {
  const { when, fallback, onMounted, beforeUnmounted, onUnmounted } = props;
  let $elm: any = null;

  const normalize = (c: any) => {
    if (c === null || c === undefined) return [];
    if (Array.isArray(c)) return c;
    return [c];
  };

  const state: { value: any; children: any[]; props: any; cases: any[] } = {
    value: undefined,
    children: [],
    props,
    cases: [],
  };

  function get_active_match() {
    if (!state.cases || state.cases.length === 0) {
      return null;
    }
    const when_value = isRef(when) ? when.value : when;
    for (const child of state.cases) {
      if (isElement(child) && child.t === "case") {
        if (child.value === when_value) {
          return child;
        }
      }
    }
    return null;
  }

  function get_target_children(match: any) {
    if (!match) {
      return fallback ? normalize(fallback()) : [];
    }
    let children = match.children;

    if (typeof children === "function") {
      return normalize(children());
    }

    if (Array.isArray(children)) {
      children = children.map((child: any) =>
        typeof child === "function" ? child() : child,
      );
      return normalize(children);
    }

    return normalize(children);
  }

  const get_children_with_value = (value: any) => {
    state.value = value;
    const activeMatch = get_active_match();
    const next = get_target_children(activeMatch);
    state.children = next;
    return next;
  };

  if (isRef(when)) {
    when.subscribe({
      onChange(value) {
        if (!$elm) {
          return;
        }
        // 如果值没有变化，直接返回
        if (value === state.value) {
          return;
        }

        // 移除旧内容
        if (typeof $elm.removeContent === "function") {
          $elm.removeContent();
        }

        // 添加新内容
        const target = get_children_with_value(value);
        if (target.length > 0 && typeof $elm.addContent === "function") {
          $elm.addContent(target);
        }
      },
    });
  }

  const initialValue = isRef(when) ? when.value : when;

  // 初始化 cases
  if (children) {
    state.cases = normalize(children);
  }

  get_children_with_value(initialValue);

  return {
    t: "match",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    get value() {
      return state.value;
    },
    children: state.children,
    props: state.props,
    cleanup() {
      if (typeof $elm?.removeContent === "function") {
        $elm.removeContent();
        state.children = [];
      }
    },
    render() {
      const value = isRef(when) ? when.value : when;

      // Create anchor if not already created
      if (!$elm) {
        $elm = safeCreateTextNode("");
      }

      // 初始化 cases
      if (children) {
        state.cases = normalize(children);
      }

      const target = get_children_with_value(value);
      state.children = target;

      return $elm;
    },
    hydrate(startDom: any, parentDom?: any) {
      const value = isRef(when) ? when.value : when;

      // Create anchor if not already created
      if (!$elm) {
        $elm = safeCreateTextNode("");
      }

      // 初始化 cases
      if (children) {
        state.cases = normalize(children);
      }

      const targetChildren = get_children_with_value(value);

      // 调用宿主层方法进行 hydrate
      if (typeof $elm.hydrateContent === "function") {
        return $elm.hydrateContent(
          targetChildren,
          startDom,
          parentDom,
          onMounted,
          (newNodes: any[], newInstances: any[]) => {
            state.children = newInstances;
          },
        );
      }

      return $elm;
    },
    beforeUnmounted() {
      if (beforeUnmounted) beforeUnmounted();
      for (const child of state.children) {
        if (isElement(child) && child.beforeUnmounted) {
          child.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      if (onUnmounted) {
        onUnmounted();
      }
      if (typeof $elm?.removeContent === "function") {
        $elm.removeContent();
        state.children = [];
      }
    },
  };
}

export function Case<T = any>(
  value: any,
  children: () => ViewChildren,
) {
  return {
    t: "case",
    value,
    children,
    render() {
      return null;
    },
  };
}
