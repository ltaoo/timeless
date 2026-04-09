import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { ViewChildren, isElement } from "@/content/type";
import { safeCreateTextNode } from "@/util/env";
import { MountedEvent } from "@/event";

type ShowProps = {
  when:
    | DerivedRef<boolean | undefined | null>
    | Ref<boolean | undefined | null>
    | boolean;
  ok: () => ViewChildren;
  else?: () => ViewChildren;
  onMounted?: ($fg: any) => void;
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};
type ShowState = { value: boolean; children: any[]; props: any };

export function Show(props: ShowProps) {
  const { when, onMounted, beforeUnmounted, onUnmounted } = props;
  let $elm: any = null;

  const state: ShowState = {
    value: false,
    children: [],
    props,
  };

  const methods = {
    normalize(children: ViewChildren) {
      if (children === null || children === undefined) return [];
      if (Array.isArray(children)) {
        return children;
      }
      return [children];
    },
    build_children_with_condition(condition: boolean) {
      const next = condition
        ? methods.normalize(props.ok())
        : props.else
          ? methods.normalize(props.else())
          : [];
      state.children = next;
      return next;
    },
    setup_value_subscribe() {
      // console.log("[show] - setup_value_subscribe", when);
      if (isRef(when)) {
        state.value = when.value as boolean;
        when.subscribe({
          onChange(value) {
            console.log("the when is changed", value, state.value);
            const condition = !!value;
            // 如果条件没有变化，直接返回
            if (condition === state.value) {
              return;
            }
            state.value = condition;
            if (!condition) {
              if ($elm && typeof $elm.removeChildren === "function") {
                $elm.removeChildren();
                // _current_nodes = [];
                state.children = [];
              }
            } else {
              const target = methods.build_children_with_condition(condition);
              if (
                $elm &&
                target.length > 0 &&
                typeof $elm.insertChildren === "function"
              ) {
                $elm.insertChildren(target);
                state.children = target;
              }
            }
          },
        });
      } else {
        state.value = !!when;
      }
    },
  };
  methods.setup_value_subscribe();
  methods.build_children_with_condition(state.value);

  return {
    t: "show",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    value: state.value,
    state,
    children: state.children,
    props: state.props,
    render() {
      const condition = isRef(when) ? !!when.value : !!when;
      state.value = condition;

      // Create anchor if not already created
      if (!$elm) {
        $elm = safeCreateTextNode("");
      }

      const target = methods.build_children_with_condition(condition);
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
      const targetChildren = methods.build_children_with_condition(condition);
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
    onMounted(event: MountedEvent) {
      if (onMounted) {
        onMounted(event);
      }
    },
    beforeUnmounted() {
      if (beforeUnmounted) {
        beforeUnmounted();
      }
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
      if ($elm && typeof $elm.removeChildren === "function") {
        $elm.removeChildren();
      }
      state.children = [];
    },
  };
}
