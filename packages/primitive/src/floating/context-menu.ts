/**
 * ContextMenu - A right-click triggered floating menu component.
 *
 * ContextMenu appears at the cursor position on right-click,
 * providing contextual actions for the target element.
 * Commonly used for:
 * - Right-click context actions
 * - Item-specific operation menus
 * - Canvas/editor context menus
 *
 * Supports reactive `visible` prop, `items` for menu options,
 * positioned at the right-click coordinates.
 *
 * @example
 * ```tsx
 * <ContextMenu
 *   visible={isOpen}
 *   position={{ x: 200, y: 150 }}
 *   items={[
 *     { label: "Copy", value: "copy" },
 *     { label: "Paste", value: "paste" },
 *   ]}
 *   onSelect={(value) => handleAction(value)}
 *   onClose={() => isOpen.as(false)}
 * >
 *   <View>Right-click here</View>
 * </ContextMenu>
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";
import { Logger } from "@/util/logger";

import { destroyElement, isElement, TimelessElement, ViewChildren } from "../content/type";
import { Box, BoxProps } from "../content/box";

const logger = Logger({ prefix: "primitive", scope: "floating/context-menu" });

/** A single context menu item */
export type ContextMenuItem = {
  /** Display label */
  label: string;
  /** Item value */
  value: string | number;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether the item is a separator */
  separator?: boolean;
};

/** Position for context menu */
export type ContextMenuPosition = {
  x: number;
  y: number;
};

/** Props for ContextMenu component */
export type ContextMenuProps = BoxProps & {
  /** Whether the context menu is visible */
  visible: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Menu position (from right-click coordinates) */
  position?: ContextMenuPosition | Ref<ContextMenuPosition>;
  /** Menu items */
  items?: ContextMenuItem[];
  /** Called when an item is selected */
  onSelect?: (value: string | number) => void;
  /** Called when the menu requests to close */
  onClose?: () => void;
};

/** Internal state for ContextMenu */
type ContextMenuState = {
  visible: boolean;
  position: ContextMenuPosition;
};

/**
 * Creates a ContextMenu component - a right-click floating menu.
 *
 * @param props - ContextMenu props (visible, position, items, onSelect, etc.)
 * @param children - Target element that triggers the menu
 * @returns A TimelessElement representing a context menu
 */
export function ContextMenu(
  props: ContextMenuProps,
  children?: ViewChildren,
): TimelessElement<ContextMenuState> {
  const { visible, position = { x: 0, y: 0 }, items, onSelect, onClose, ...rest } = props;

  let $elm: any = null;
  const initPos = isRef(position) ? position.value : position;
  let box$ = Box(rest, { visible: false, position: initPos });

  const state = box$.state as typeof box$.state & ContextMenuState;
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
    subscribe_position() {
      if (isRef(position)) {
        state.position = position.value;
        const unsub = position.subscribe({
          onChange(v) {
            state.position = v as ContextMenuPosition;
          },
        });
        box$.methods.unsubscribe(unsub);
      }
    },
  };

  methods.subscribe_props();
  methods.subscribe_visible();
  methods.subscribe_position();
  box$.methods.add_event();

  // Build children: target element
  box$.methods.build_children(children);

  return {
    t: "context-menu",
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

export type ContextMenu = ReturnType<typeof ContextMenu>;
