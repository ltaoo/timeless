/**
 * View - The primary generic container component in Timeless.
 *
 * View is the main building block for UI, similar to a div in HTML.
 * It's more generic than Box and provides:
 * - Full attribute/style/class management
 * - Complete event handling
 * - Child rendering
 * - Reactive prop support
 *
 * Most components are built on View or compose it.
 *
 * @example
 * ```tsx
 * <View
 *   id="container"
 *   style={{ padding: 16 }}
 *   class="card"
 *   onClick={handleClick}
 * >
 *   <Text>Content</Text>
 * </View>
 * ```
 */
import { MountedEvent } from "@/event/index";
import { Logger } from "@/util/logger";

import { destroyElement, isElement, TimelessElement, ViewChildren } from "./type";
import { Box, BoxProps } from "./box";

const logger = Logger({ prefix: "primitive", scope: "content/view" });

/** Props for View component */
export type ViewProps = BoxProps & {
  /** Element ID */
  id?: string;
  /** Unique key for list rendering */
  key?: string | number;
  /** HTML tag to render as */
  as?: string;
  /** Whether element is draggable */
  draggable?: boolean;
};

/** Internal state for View */
type ViewState = {};

/**
 * Creates a View component - the primary container.
 *
 * @param props - View props (style, class, events, etc.)
 * @param children - Child elements
 * @returns A TimelessElement representing a view/container
 */
export function View(
  props: ViewProps = {},
  children?: ViewChildren,
): TimelessElement<ViewState> {
  const { ...rest } = props;

  let $elm: any = null;
  let box$ = Box(rest, {});

  const state = box$.state;
  const events = box$.events;

  // Track mount-cycle cleanups separately from ref subscriptions.
  // Ref subscriptions (style, class, attrs, dataset) must persist
  // across mount/unmount cycles because the VNode object outlives its DOM.
  const _mount_cleanups: (() => void)[] = [];

  const _unmount = () => {
    // Clean up mount-cycle subscriptions (event listeners, etc.)
    // but keep ref subscriptions alive — the VNode outlives its DOM.
    _mount_cleanups.forEach((fn) => fn());
    _mount_cleanups.length = 0;
    // Clear $elm on both view and box without destroying ref subscriptions
    box$.methods.set$elm(null);
    if (rest.onUnmounted) {
      rest.onUnmounted();
    }
    state.rendered = false;
    $elm = null;
  };

  const methods = {
    // Helper: setup bindings (attributes, class, style, events)
    subscribe_props() {
      // Only subscribe once — ref subscriptions persist across mount/unmount
      if (box$.listener$.length === 0) {
        box$.methods.subscribe_props();
      }
    },
  };

  methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "view",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (rest.onMounted) {
        const cleanup = rest.onMounted(event);
        if (typeof cleanup === "function") {
          _mount_cleanups.push(cleanup);
        }
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (rest.beforeUnmounted) {
        rest.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      _unmount();
    },
    destroy() {
      // Full cleanup — the VNode is permanently destroyed.
      _unmount();
      // Destroy ref subscriptions (style, class, attrs, etc.)
      box$.methods.destroy();
      // Propagate to children
      for (let i = 0; i < state.children.length; i += 1) {
        destroyElement(state.children[i]);
      }
    },
  };
}

export type View = ReturnType<typeof View>;
