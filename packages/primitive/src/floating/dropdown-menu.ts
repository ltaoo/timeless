/**
 * DropdownMenu - A floating dropdown menu component.
 *
 * DropdownMenu renders a positioned list of items that appears
 * when triggered, floating above other content.
 * Commonly used for:
 * - Context menus
 * - Action menus
 * - Selection lists
 * - Navigation dropdowns
 *
 * Supports reactive `visible` prop, `items` for menu options,
 * and `onSelect` callback for item selection.
 *
 * @example
 * ```tsx
 * <DropdownMenu
 *   visible={isOpen}
 *   items={[
 *     { label: "Edit", value: "edit" },
 *     { label: "Delete", value: "delete" },
 *   ]}
 *   onSelect={(value) => console.log(value)}
 * >
 *   <Button>Actions</Button>
 * </DropdownMenu>
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/reactive";
import { Logger } from "@/util/logger";

import { destroyElement, isElement, TimelessElement, ViewChildren } from "../content/type";
import { Box, BoxProps } from "../content/box";

const logger = Logger({ prefix: "primitive", scope: "floating/dropdown-menu" });

/** A single menu item */
export type DropdownMenuItem = {
  /** Display label */
  label: string;
  /** Item value */
  value: string | number;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether the item is a separator */
  separator?: boolean;
};

/** Props for DropdownMenu component */
export type DropdownMenuProps = BoxProps & {
  /** Whether the dropdown is visible */
  visible: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Menu items */
  items?: DropdownMenuItem[];
  /** Called when an item is selected */
  onSelect?: (value: string | number) => void;
  /** Called when the dropdown requests to close */
  onClose?: () => void;
};

/** Internal state for DropdownMenu */
type DropdownMenuState = {
  visible: boolean;
};

/**
 * Creates a DropdownMenu component - a floating menu list.
 *
 * @param props - DropdownMenu props (visible, items, onSelect, etc.)
 * @param children - Trigger element
 * @returns A TimelessElement representing a dropdown menu
 */
export function DropdownMenu(
  props: DropdownMenuProps,
  children?: ViewChildren,
): TimelessElement<DropdownMenuState> {
  const { visible, items, onSelect, onClose, ...rest } = props;

  let $elm: any = null;
  let box$ = Box(rest, { visible: false });

  const state = box$.state as typeof box$.state & DropdownMenuState;
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

  // Build children: trigger element
  box$.methods.build_children(children);

  return {
    t: "dropdown-menu",
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

export type DropdownMenu = ReturnType<typeof DropdownMenu>;
