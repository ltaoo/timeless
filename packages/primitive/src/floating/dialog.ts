/**
 * Dialog - A modal dialog popup component.
 *
 * Dialog renders an overlay with centered content, suitable for:
 * - Confirmation dialogs
 * - Alert dialogs
 * - Form modals
 * - Custom modal content
 *
 * Supports reactive `visible` prop to control show/hide,
 * and `onClose` callback for overlay/escape dismissal.
 *
 * @example
 * ```tsx
 * <Dialog
 *   visible={isOpen}
 *   title="Confirm"
 *   onClose={() => isOpen.as(false)}
 * >
 *   <Text>Are you sure?</Text>
 * </Dialog>
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";
import { Logger } from "@/util/logger";

import { destroyElement, isElement, TimelessElement, ViewChildren } from "@/content/type";
import { Box, BoxProps } from "@/content/box";

const logger = Logger({ prefix: "primitive", scope: "floating/dialog" });

/** Props for Dialog component */
export type DialogProps = BoxProps & {
  /** Whether the dialog is visible */
  visible: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Called when the dialog requests to close (overlay click) */
  onClose?: () => void;
  /** Dialog title */
  title?: string;
};

/** Internal state for Dialog */
type DialogState = {
  visible: boolean;
};

/**
 * Creates a Dialog component - a modal popup.
 *
 * @param props - Dialog props (visible, title, onClose, etc.)
 * @param children - Dialog content
 * @returns A TimelessElement representing a modal dialog
 */
export function Dialog(
  props: DialogProps,
  children?: ViewChildren,
): TimelessElement<DialogState> {
  const { visible, title, onClose, ...rest } = props;

  let $elm: any = null;
  let box$ = Box(rest, { visible: false });

  const state = box$.state as typeof box$.state & DialogState;
  const events = box$.events;

  // Track mount-cycle cleanups separately from ref subscriptions.
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
      // Only close when clicking the overlay itself
      if (e.target === $elm) {
        onClose();
      }
    };
  }

  // Build children: overlay wraps content
  if (children) {
    box$.methods.build_children(children);
  }

  return {
    t: "dialog",
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

export type Dialog = ReturnType<typeof Dialog>;
