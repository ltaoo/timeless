/**
 * Toaster - A toast notification popup component.
 *
 * Toaster renders a floating notification message at a corner of the screen.
 * Commonly used for:
 * - Success/error/info feedback
 * - Transient status messages
 * - Operation confirmations
 *
 * Supports reactive `visible` prop, `type` for styling,
 * and `position` for corner placement.
 *
 * @example
 * ```tsx
 * <Toaster
 *   visible={isOpen}
 *   type="success"
 *   message="Operation completed"
 *   position="top-right"
 * />
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";
import { Logger } from "@/util/logger";

import { destroyElement, isElement, TimelessElement, ViewChildren } from "../content/type";
import { Box, BoxProps } from "../content/box";

const logger = Logger({ prefix: "primitive", scope: "floating/toaster" });

/** Toast notification type */
export type ToasterType = "normal" | "success" | "error" | "info" | "warning" | "loading";

/** Toast position on screen */
export type ToasterPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/** Props for Toaster component */
export type ToasterProps = BoxProps & {
  /** Whether the toaster is visible */
  visible: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Notification type for icon and styling */
  type?: ToasterType;
  /** Screen corner to render in */
  position?: ToasterPosition;
  /** Primary message text */
  message?: string;
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Called when the toaster dismisses */
  onDismiss?: () => void;
};

/** Internal state for Toaster */
type ToasterState = {
  visible: boolean;
  type: ToasterType;
  position: ToasterPosition;
};

/**
 * Creates a Toaster component - a notification toast.
 *
 * @param props - Toaster props (visible, type, message, position, etc.)
 * @param children - Additional content
 * @returns A TimelessElement representing a toast notification
 */
export function Toaster(
  props: ToasterProps,
  children?: ViewChildren,
): TimelessElement<ToasterState> {
  const {
    visible,
    type = "normal",
    position = "top-right",
    duration = 0,
    onDismiss,
    ...rest
  } = props;

  let $elm: any = null;
  let box$ = Box(rest, { visible: false, type, position });

  const state = box$.state as typeof box$.state & ToasterState;
  const events = box$.events;

  const _mount_cleanups: (() => void)[] = [];

  const _unmount = () => {
    _mount_cleanups.forEach((fn) => fn());
    _mount_cleanups.length = 0;
    box$.methods.set$elm(null);
    if (rest.onUnmounted) {
      rest.onUnmounted();
    }
    state.rendered = false;
    $elm = null;
  };

  const methods = {
    subscribe_props() {
      if (box$.listener$.length === 0) {
        box$.methods.subscribe_props();
      }
    },
    subscribe_visible() {
      if (isRef(visible)) {
        state.visible = visible.value as boolean;
        const unsub = visible.subscribe({
          onChange(v) {
            state.visible = v as boolean;
          },
        });
        box$.methods.unsubscribe(unsub);
      } else if (typeof visible === "boolean") {
        state.visible = visible;
      }
    },
  };

  methods.subscribe_props();
  methods.subscribe_visible();
  box$.methods.add_event();

  // Build children
  if (children) {
    box$.methods.build_children(children);
  }

  return {
    t: "toaster",
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
    onMounted(event) {
      state.rendered = true;
      if (rest.onMounted) {
        const cleanup = rest.onMounted(event);
        if (typeof cleanup === "function") {
          _mount_cleanups.push(cleanup);
        }
      }
      // Auto-dismiss timer
      if (duration > 0 && onDismiss) {
        const timer = setTimeout(() => {
          onDismiss();
        }, duration);
        _mount_cleanups.push(() => clearTimeout(timer));
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
      _unmount();
      box$.methods.destroy();
      for (let i = 0; i < state.children.length; i += 1) {
        destroyElement(state.children[i]);
      }
    },
  };
}

export type Toaster = ReturnType<typeof Toaster>;
