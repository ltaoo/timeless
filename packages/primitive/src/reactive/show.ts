import { isRef, Ref } from "@timeless/reactive";

import { ViewChildren, isElement } from "@/content/type";
import { safeCreateTextNode } from "@/util/env";

export function Show(props: {
  when: Ref<boolean> | Ref<boolean | undefined | null> | boolean;
  ok: () => ViewChildren;
  else?: () => ViewChildren;
  onMounted?: ($fg: any) => void;
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
}) {
  const {
    when,
    ok: okFn,
    else: elseFn,
    onMounted,
    beforeUnmounted,
    onUnmounted,
  } = props;
  let $elm: any = null;

  // let _current_nodes: any[] = [];
  // let _current_children: any[] = [];
  // let _prev_condition: boolean | null = null;

  const methods = {
    normalize(children: ViewChildren) {
      if (children === null || children === undefined) return [];
      if (Array.isArray(children)) {
        return children;
      }
      return [children];
    },
    get_children_with_condition(condition: boolean) {
      const next = condition
        ? methods.normalize(okFn())
        : elseFn
          ? methods.normalize(elseFn())
          : [];
      state.value = condition;
      state.children = next;
      return next;
    },
    setup() {
      if (isRef(when)) {
        when.subscribe({
          onChange(value) {
            const condition = !!value;
            if (!$elm) {
              return;
            }
            // 如果条件没有变化，直接返回
            if (condition === state.value) {
              return;
            }
            state.value = condition;
            if (!condition) {
              if (typeof $elm.removeContent === "function") {
                $elm.removeContent();
                // _current_nodes = [];
                state.children = [];
              }
            } else {
              const target = methods.get_children_with_condition(condition);
              if (target.length > 0 && typeof $elm.addContent === "function") {
                $elm.addContent(target);
                state.children = target;
              }
            }
          },
        });
      }
    },
  };

  const state: { value: boolean; children: any[]; props: any } = {
    value: false,
    children: [],
    props,
  };

  const condition = isRef(when) ? !!when.value : !!when;
  methods.get_children_with_condition(condition);

  return {
    t: "show",
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
      // console.log("[Show] cleanup called");
      // 清理当前挂载的所有内容
      if (typeof $elm?.removeContent === "function") {
        $elm.removeContent();
        state.children = [];
      }
    },
    render() {
      const condition = isRef(when) ? !!when.value : !!when;
      state.value = condition;

      // Create anchor if not already created
      if (!$elm) {
        $elm = safeCreateTextNode("");
      }

      const target = methods.get_children_with_condition(condition);
      state.children = target;

      // 如果宿主不支持，返回 anchor
      return $elm;
    },
    hydrate(startDom: any, parentDom?: any) {
      const condition = isRef(when) ? !!when.value : !!when;
      state.value = condition;

      // Create anchor if not already created
      if (!$elm) {
        $elm = safeCreateTextNode("");
      }

      const targetChildren = methods.get_children_with_condition(condition);

      // 调用宿主层方法进行 hydrate
      if (typeof $elm.hydrateContent === "function") {
        return $elm.hydrateContent(
          targetChildren,
          startDom,
          parentDom,
          onMounted,
          (newNodes: any[], newInstances: any[]) => {
            // _current_nodes = newNodes;
            state.children = newInstances;
          },
        );
      }

      // 如果宿主不支持，返回 anchor
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
