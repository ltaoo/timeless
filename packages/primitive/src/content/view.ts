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
import { MountedEvent, PointerInfo } from "@/event/index";
import { Logger } from "@/util/logger";
import { createPointerTracker } from "@/util/pointer";

import { destroyElement, isElement, TimelessElement, ViewChildren } from "./type";
import { Box, BoxProps } from "./box";

const logger = Logger({ prefix: "primitive", scope: "content/view" });

/** Props for View component */
export type ViewProps = Omit<BoxProps, "onPointerDown" | "onPointerUp"> & {
  /** Element ID */
  id?: string;
  /** Unique key for list rendering */
  key?: string | number;
  /** HTML tag to render as */
  as?: string;
  /** Whether element is draggable */
  draggable?: boolean;
  /**
   * 指针按下；`info` 提供按下位置与累计位移。
   *
   * View 一定派发 `info`；声明为可选是为了让 ViewProps 仍能赋给 BoxProps
   * （Box 只挂原生事件，没有 info），这样各组件透传 props 不受影响。
   */
  onPointerDown?: (event: PointerEvent, info?: PointerInfo) => void;
  /** 按下后指针移动（可移出元素）；`info` 提供位移距离与方向 */
  onPointerMove?: (event: PointerEvent, info?: PointerInfo) => void;
  /** 指针抬起；`info` 为本次拖动的最终位移 */
  onPointerUp?: (event: PointerEvent, info?: PointerInfo) => void;
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
  // 指针事件由 tracker 派发，不交给 Box（Box 只认识单参数的原生事件）。
  const { onPointerDown, onPointerMove, onPointerUp, ...rest } = props;

  let $elm: any = null;
  let box$ = Box(rest, {});

  const state = box$.state;
  const events = box$.events;

  // 指针事件（含位移信息）由 tracker 统一派发；仅在消费方使用指针事件时才创建。
  const pointer_ = createPointerTracker({
    onPointerDown,
    onPointerMove,
    onPointerUp,
  });
  const has_pointer = Boolean(onPointerDown || onPointerMove || onPointerUp);

  // Track mount-cycle cleanups separately from ref subscriptions.
  // Ref subscriptions (style, class, attrs, dataset) must persist
  // across mount/unmount cycles because the VNode object outlives its DOM.
  const _mount_cleanups: (() => void)[] = [];

  const _unmount = () => {
    // Clean up mount-cycle subscriptions (event listeners, etc.)
    // but keep ref subscriptions alive — the VNode outlives its DOM.
    _mount_cleanups.forEach((fn) => fn());
    _mount_cleanups.length = 0;
    pointer_.dispose();
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
  if (has_pointer) {
    // 按下改由 tracker 接管（附带位移信息）；抬起 / 取消走全局监听
    events.onPointerDown = pointer_.handleDown;
    events.onPointerUp = undefined;
  }
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
