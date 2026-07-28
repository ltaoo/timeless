import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";

import {
  TimelessElement,
  ViewChildren,
  isElement,
  resolve_children,
  destroyElement,
} from "@/content/type";
import { MountedEvent } from "@/event";
import { Text } from "@/content/text";
import { ListenerManager } from "@/util/listener";
import {
  get_owner,
  create_owner,
  run_with_owner,
  dispose_owner,
  clear_owner_disposables,
} from "@/context/context";
import { useErrorBoundary } from "@/content/error-boundary-context";

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
  let _owner = create_owner(_parent_owner);

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
      const elements = run_with_owner(_owner, evaluate);
      for (let i = 0; i < elements.length; i += 1) {
        const elm = elements[i];
        (() => {
          if (isElement(elm)) {
            children[i] = elm;
            return;
          }
          if (isRef(elm)) {
            children[i] = Text(elm);
            return;
          }
          if (elm) {
            children[i] = Text(String(elm));
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
            if (condition === state.value) {
              return;
            }
            state.value = condition;
            if ($elm && typeof $elm.removeChildren === "function") {
              $elm.removeChildren();
            }
            // Unmount old children before any condition change
            for (const child of state.children) {
              if (isElement(child)) {
                if (child.beforeUnmounted) child.beforeUnmounted();
                if (child.onUnmounted) child.onUnmounted();
              }
            }
            if (!condition) {
              if (props.else) {
                const target = methods.build_children_with_condition(condition);
                state.children = target;
                if ($elm && typeof $elm.insertChildren === "function") {
                  $elm.insertChildren(target);
                }
                return;
              }
              state.children = [];
            } else {
              const target = methods.build_children_with_condition(condition);
              state.children = target;
              if ($elm && typeof $elm.insertChildren === "function") {
                $elm.insertChildren(target);
              }
            }
          },
        });
        listener$.add(unsubscribe);
        _hmr_subs.push(unsubscribe);
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
      // Re-subscribe to when prop when remounting after unmount
      // (listener$ is cleared by destroy() in onUnmounted)
      if (listener$.length === 0) {
        // _owner was disposed in onUnmounted, re-create it
        // so build_children_with_condition can track new render-created refs
        dispose_owner(_owner);
        _owner = create_owner(_parent_owner);
        methods.subscribe_props();
        // Rebuild children to match current ref value.
        // When remounting after unmount, state.children may be stale
        // (e.g. checkmark VNodes from a previous render when ref was true).
        // The parent's insertChildren has already rendered stale children
        // into DOM at this point, so we need to replace them.
        if ($elm && typeof $elm.removeChildren === "function") {
          const freshChildren = methods.build_children_with_condition(state.value);
          state.children = freshChildren;
          if ($elm && typeof $elm.insertChildren === "function") {
            $elm.insertChildren(freshChildren);
          }
        }
      }
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
      _hmr_subs.forEach((fn) => fn());
      _hmr_subs.length = 0;
      // Don't clear state.children here — they are needed if this Show
      // is re-mounted by a parent (e.g. Presence show/hide cycle).
      // When Show's own condition flips false, onChange already clears children.
    },
    destroy() {
      // Permanent teardown — propagate to children and clear state
      for (const child of state.children) {
        destroyElement(child);
      }
      state.children = [];
    },
    _hmr_dispose() {
      // Only unsubscribe — do NOT destroy the shared ref (visible_ etc.)
      _hmr_subs.forEach((fn) => fn());
      _hmr_subs.length = 0;
    },
  };
}
