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

import { isElement, TimelessElement, ViewChildren } from "./type";
import { Box, BoxProps } from "./box";

const logger = Logger({ prefix: "primitive", scope: "content/list-item-view" });

/** Props for View component */
export type ViewProps = BoxProps & {
  /** Element ID */
  id?: string;
  /** Unique key for list rendering */
  key?: string | number;
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
export function ListItemView(
  props: ViewProps = {},
  children?: ViewChildren,
): TimelessElement<ViewState> {
  const { ...rest } = props;

  const box$ = Box(rest, {});

  let $elm: any = null;

  const state = box$.state;
  const events = box$.events;

  const methods = {
    // Helper: setup bindings (attributes, class, style, events)
    subscribe_props() {
      box$.methods.subscribe_props();
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
    events,
    children: state.children,
    onMounted(event: MountedEvent) {
      // logger.log("onMounted", state.children.length);
      state.rendered = true;
      if (rest.onMounted) {
        box$.methods.unsubscribe(rest.onMounted(event));
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
      // logger.log("onUnmounted", box$.listener$.length);
      box$.methods.destroy();
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
      state.rendered = false;
      $elm = null;
    },
  };
}

export type ListItemView = ReturnType<typeof ListItemView>;
