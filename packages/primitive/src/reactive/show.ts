import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import {
  TimelessElement,
  ViewChildren,
  isElement,
  resolve_children,
} from "@/content/type";
import { MountedEvent } from "@/event";
import { Text } from "@/content/text";
import { ListenerManager } from "@/util/listener";
import { Logger } from "@/util/logger";
import {
  get_owner,
  create_owner,
  run_with_owner,
  dispose_owner,
  clear_owner_disposables,
} from "@/context/context";
import { useErrorBoundary } from "@/content/error-boundary-context";

const logger = Logger({ prefix: "primitive", scope: "reactive/show" });

export type ShowProps = {
  when:
    | DerivedRef<boolean | undefined | null>
    | Ref<boolean | undefined | null>
    | boolean;
  ok: () => ViewChildren | undefined;
  else?: () => ViewChildren | undefined;
  onMounted?: ($fg: any) => void;
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};
type ShowState = {
  rendered: boolean;
  value: boolean;
  children: (TimelessElement | null)[];
};

export function Show(props: ShowProps) {
  const { when, onMounted, beforeUnmounted, onUnmounted } = props;

  let $elm: any = null;
  const _parent_owner = get_owner();
  // Create own owner so render-created refs are tracked separately from parent
  const _owner = create_owner(_parent_owner);

  const state: ShowState = {
    rendered: false,
    value: false,
    children: [],
  };
  const listener$ = ListenerManager();
  // Track subscription unsubscribers separately for HMR —
  // _hmr_dispose must only unsubscribe, NOT destroy the shared ref.
  const _hmr_subs: (() => void)[] = [];

  const methods = {
    normalize_children(children?: ViewChildren) {
      if (children === null || children === undefined) return [];
      const resolved = resolve_children(children);
      if (!resolved) return [];
      if (Array.isArray(resolved)) {
        return resolved;
      }
      return [resolved];
    },
    build_children_with_condition(condition: boolean) {
      // Clear old render's disposables before building new children
      clear_owner_disposables(_owner);
      const children: (TimelessElement | null)[] = [];
      const evaluate = () => {
        try {
          if (condition) {
            return methods.normalize_children(props.ok());
          }
          if (props.else) {
            return methods.normalize_children(props.else());
          }
          return [];
        } catch (error) {
          const boundary = useErrorBoundary();
          if (boundary) {
            return boundary.handle(error);
          }
          throw error;
        }
      };
      const next = run_with_owner(_owner, evaluate);
      for (let i = 0; i < next.length; i += 1) {
        const node = next[i];
        (() => {
          if (isElement(node)) {
            children[i] = node;
            return;
          }
          if (isRef(node)) {
            children[i] = Text(node);
            return;
          }
          if (node) {
            children[i] = Text(String(node));
            return;
          }
          children[i] = null;
        })();
      }
      // console.log('build children', next.length, children);
      return children;
    },
    subscribe_props() {
      // console.log("[show] - setup_value_subscribe", when);
      if (isRef(when)) {
        state.value = !!when.value;
        const unsubscribe = when.subscribe({
          onChange(value) {
            const condition = !!value;
            // logger.log("the when is changed", condition, state.value);
            // 如果条件没有变化，直接返回
            if (condition === state.value) {
              return;
            }
            state.value = condition;
            if (!condition) {
              if (props.else) {
                if ($elm && typeof $elm.removeChildren === "function") {
                  $elm.removeChildren();
                }
                const target = methods.build_children_with_condition(condition);
                state.children = target;
                logger.log("before insert", target, !!$elm?.insertChildren);
                if ($elm && typeof $elm.insertChildren === "function") {
                  $elm.insertChildren(target);
                }
                return;
              }
              state.children = [];
              logger.log("before remove", !!$elm?.insertChildren);
              if ($elm && typeof $elm.removeChildren === "function") {
                $elm.removeChildren();
              }
            } else {
              if ($elm && typeof $elm.removeChildren === "function") {
                $elm.removeChildren();
              }
              const target = methods.build_children_with_condition(condition);
              state.children = target;
              // logger.log("before insert children", target.length);
              logger.log("before insert", !!$elm?.insertChildren);
              if ($elm && typeof $elm.insertChildren === "function") {
                $elm.insertChildren(target);
              } else {
                logger.warn(
                  "[Show.onChange] SKIPPED insertChildren — $elm is",
                  $elm,
                );
              }
            }
          },
        });
        // listener$.add(unsubscribe);
        // _hmr_subs.push(unsubscribe);
      } else {
        state.value = !!when;
      }
    },
  };
  methods.subscribe_props();
  state.children = methods.build_children_with_condition(state.value);

  return {
    t: "show",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    state: {
      value: state.value,
    },
    get children() {
      return state.children;
    },
    set children(v) {
      state.children = v;
    },
    onMounted(event: MountedEvent) {
      if (onMounted) {
        listener$.add(onMounted(event));
      }
      for (const child of state.children) {
        if (isElement(child) && child.onMounted) {
          child.onMounted({
            target: child.$elm,
          });
        }
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
      listener$.destroy();
      // Dispose all refs created during render callbacks
      dispose_owner(_owner);
      // Don't clear state.children here — they are needed if this Show
      // is re-mounted by a parent (e.g. Presence show/hide cycle).
      // When Show's own condition flips false, onChange already clears children.
    },
    _hmr_dispose() {
      // Only unsubscribe — do NOT destroy the shared ref (visible_ etc.)
      _hmr_subs.forEach((fn) => fn());
      _hmr_subs.length = 0;
    },
  };
}
