/**
 * Drawer - A panel that slides in from the edge of the screen.
 *
 * Drawer renders an overlay + sliding panel from a specified side.
 * Commonly used for:
 * - Side sheets
 * - Slide-out menus
 * - Bottom sheets
 * - Detail panels
 *
 * Supports reactive `visible` prop and `side` placement.
 *
 * @example
 * ```tsx
 * <Drawer
 *   visible={isOpen}
 *   side="right"
 *   onClose={() => isOpen.as(false)}
 * >
 *   <Text>Drawer content</Text>
 * </Drawer>
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/reactive";
import { Logger } from "@/util/logger";

import { destroyElement, isElement, TimelessElement, ViewChildren } from "../content/type";
import { Box, BoxProps } from "../content/box";

const logger = Logger({ prefix: "primitive", scope: "floating/drawer" });

/** Side from which the drawer enters */
export type DrawerSide = "top" | "right" | "bottom" | "left";

/** Props for Drawer component */
export type DrawerProps = BoxProps & {
  /** Whether the drawer is visible */
  visible: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Called when the drawer requests to close (overlay click) */
  onClose?: () => void;
  /** Edge the drawer slides in from */
  side?: DrawerSide;
};

/** Internal state for Drawer */
type DrawerState = {
  visible: boolean;
  side: DrawerSide;
};

/**
 * Creates a Drawer component - a sliding panel.
 *
 * @param props - Drawer props (visible, side, onClose, etc.)
 * @param children - Drawer content
 * @returns A TimelessElement representing a sliding drawer
 */
export function Drawer(
  props: DrawerProps,
  children?: ViewChildren,
): TimelessElement<DrawerState> {
  const { visible, side = "right", onClose, ...rest } = props;

  let $elm: any = null;
  let box$ = Box(rest, { visible: false, side });

  const state = box$.state as typeof box$.state & DrawerState;
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

  // Build overlay click handler
  if (onClose) {
    events.onClick = (e: MouseEvent) => {
      if (e.target === $elm) {
        onClose();
      }
    };
  }

  // Build children
  if (children) {
    box$.methods.build_children(children);
  }

  return {
    t: "drawer",
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

export type Drawer = ReturnType<typeof Drawer>;
