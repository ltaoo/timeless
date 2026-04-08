import { isRef, Ref } from "@timeless/reactive";

import { TimelessElement, ViewChildren, isElement } from "@/content/type";
import { safeCreateTextNode } from "@/util/env";
import { MountedEvent } from "@/event";

type MatchProps = {
  when: Ref<any> | any;
  cases: Record<string | number, () => TimelessElement[]>;
  fallback?: () => TimelessElement;
  onMounted?: (event: MountedEvent) => void;
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};

type MatchState = {
  rendered: boolean;
  value: any;
  children: TimelessElement[];
  // props: MatchProps;
};

export function Match(props: MatchProps) {
  const { when, cases, fallback, onMounted, beforeUnmounted, onUnmounted } =
    props;
  let $elm: any = null;

  const state: MatchState = {
    rendered: false,
    value: undefined,
    children: [],
    // props,
  };

  const methods = {
    normalize(
      children: TimelessElement[] | TimelessElement,
    ): TimelessElement[] {
      if (children === null || children === undefined) return [];
      if (Array.isArray(children)) {
        return children;
      }
      return [children];
    },

    get_children_with_value(value: any) {
      state.value = value;

      // 查找匹配的 case
      if (cases && cases[value]) {
        const next = methods.normalize(cases[value]());
        state.children.push(...next);
        return next;
      }

      // 使用 fallback
      const next = fallback ? methods.normalize(fallback()) : [];
      state.children = next;
      return next;
    },

    cleanup_old_children() {
      // 清理旧的子节点
      for (const child of state.children) {
        if (isElement(child)) {
          if (child.beforeUnmounted) {
            child.beforeUnmounted();
          }
          if (child.onUnmounted) {
            child.onUnmounted();
          }
        }
      }
    },

    setup_value_subscribe() {
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

            // 清理旧内容的生命周期
            methods.cleanup_old_children();

            // 移除旧内容
            if (typeof $elm.removeContent === "function") {
              $elm.removeContent();
            }

            // 获取新内容
            const target = methods.get_children_with_value(value);

            // 添加新内容
            if (target.length > 0 && typeof $elm.addContent === "function") {
              $elm.addContent(target);
            } else {
              state.children = [];
            }
          },
        });
      }
    },
  };

  const v = isRef(when) ? when.value : when;
  state.value = v;
  methods.get_children_with_value(v);
  methods.setup_value_subscribe();

  return {
    t: "match",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    value: state.value,
    state,
    children: state.children,
    // props: state.props,
    render() {
      const value = isRef(when) ? when.value : when;
      state.value = value;

      // Create anchor if not already created
      if (!$elm) {
        $elm = safeCreateTextNode("");
      }

      const target = methods.get_children_with_value(value);
      state.children = target;

      return $elm;
    },
    hydrate(startDom: any, parentDom?: any) {
      const value = isRef(when) ? when.value : when;
      state.value = value;

      // Create anchor if not already created
      if (!$elm) {
        $elm = safeCreateTextNode("");
      }

      const targetChildren = methods.get_children_with_value(value);

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
    cleanup() {
      methods.cleanup_old_children();
      if (typeof $elm?.removeContent === "function") {
        $elm.removeContent();
        state.children = [];
      }
    },
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (onMounted) {
        onMounted(event);
      }
    },
    beforeUnmounted() {
      if (beforeUnmounted) beforeUnmounted();
      methods.cleanup_old_children();
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
