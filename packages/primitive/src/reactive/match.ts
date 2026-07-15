import { isRef, Ref } from "@timeless/reactive";

import {
  TimelessElement,
  ViewChildren,
  ViewChildrenArray,
  isElement,
  resolve_children,
  destroyElement,
} from "@/content/type";
import { MountedEvent } from "@/event";
import { Text } from "@/content/text";
import { ListenerManager } from "@/util/listener";

type MatchProps = {
  when: Ref<any> | any;
  cases: Record<string | number, () => ViewChildren>;
  fallback?: () => ViewChildren;
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
  const listener$ = ListenerManager();

  const state: MatchState = {
    rendered: false,
    value: undefined,
    children: [],
    // props,
  };

  const methods = {
    normalize(children: ViewChildren): ViewChildrenArray {
      const resolved = resolve_children(children);
      if (!resolved) return [];
      if (Array.isArray(resolved)) {
        return resolved;
      }
      return [resolved];
    },
    build_children_with_value(value: any) {
      const result: TimelessElement[] = [];
      state.value = value;
      // 查找匹配的 case
      if (cases && cases[value]) {
        const children = cases[value]();
        const next = methods.normalize(children);
        for (const child of next) {
          if (isElement(child)) {
            result.push(child);
          } else if (isRef(child)) {
            result.push(Text(child));
          } else if (child) {
            result.push(Text(String(child)));
          }
        }
        state.children = result;
        return result;
      }

      // 使用 fallback
      if (fallback) {
        const children = methods.normalize(fallback());
        for (const child of children) {
          if (isElement(child)) {
            result.push(child);
          } else if (isRef(child)) {
            result.push(Text(child));
          } else if (child) {
            result.push(Text(String(child)));
          }
        }
        state.children = result;
        return result;
      }
      return [];
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
        const unsub = when.subscribe({
          onChange(value) {
            if (!$elm) {
              return;
            }
            // 如果值没有变化，直接返回
            if (value === state.value) {
              return;
            }
            state.value = value;
            // 清理旧内容的生命周期
            // methods.cleanup_old_children();

            // 移除旧内容
            if (typeof $elm.removeChildren === "function") {
              $elm.removeChildren();
            }
            for (const child of state.children) {
              if (isElement(child)) {
                if (child.beforeUnmounted) child.beforeUnmounted();
                if (child.onUnmounted) child.onUnmounted();
              }
            }
            const target = methods.build_children_with_value(value);
            state.children = target;
            $elm.insertChildren(target);
          },
        });
        listener$.push(unsub);
      }
    },
  };

  const v = isRef(when) ? when.value : when;
  state.value = v;
  methods.build_children_with_value(v);
  methods.setup_value_subscribe();

  return {
    t: "match",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    state: {
      value: state.value,
    },
    children: state.children,
    // props: state.props,
    render() {
      const value = isRef(when) ? when.value : when;
      state.value = value;

      // Create anchor if not already created
      // if (!$elm) {
      //   $elm = safeCreateTextNode("");
      // }

      const target = methods.build_children_with_value(value);
      state.children = target;

      return $elm;
    },
    hydrate(startDom: any, parentDom?: any) {
      const value = isRef(when) ? when.value : when;
      state.value = value;

      // Create anchor if not already created
      // if (!$elm) {
      //   $elm = safeCreateTextNode("");
      // }

      const targetChildren = methods.build_children_with_value(value);

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
      if (typeof $elm?.removeChildren === "function") {
        $elm.removeChildren();
        state.children = [];
      }
    },
    onMounted(event: MountedEvent) {
      // Re-subscribe to when prop when remounting after unmount
      // (listener$ is cleared by destroy() in onUnmounted)
      if (listener$.length === 0) {
        methods.setup_value_subscribe();
      }
      state.rendered = true;
      if (onMounted) {
        onMounted(event);
      }
      for (const child of state.children) {
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (beforeUnmounted) beforeUnmounted();
      methods.cleanup_old_children();
    },
    onUnmounted() {
      listener$.destroy();
      if (onUnmounted) {
        onUnmounted();
      }
      if ($elm && typeof $elm.removeChildren === "function") {
        $elm.removeChildren();
        state.children = [];
      }
    },
    destroy() {
      // Permanent teardown — propagate to children and clear state
      for (const child of state.children) {
        destroyElement(child);
      }
      state.children = [];
    },
  };
}
