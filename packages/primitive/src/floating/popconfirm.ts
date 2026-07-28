/**
 * Popconfirm - A confirmation popover anchored to a trigger element.
 *
 * Popconfirm displays a floating confirmation card near a trigger,
 * typically used for destructive or important actions that need
 * user confirmation before proceeding.
 *
 * Supports reactive `visible` prop to control show/hide,
 * `onConfirm` and `onCancel` callbacks, title and description.
 *
 * @example
 * ```tsx
 * <Popconfirm
 *   visible={isOpen}
 *   title="Delete item?"
 *   description="This action cannot be undone."
 *   onConfirm={() => handleDelete()}
 *   onCancel={() => isOpen.as(false)}
 * >
 *   <Button>Delete</Button>
 * </Popconfirm>
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";
import { Logger } from "@/util/logger";

import { destroyElement, isElement, TimelessElement, ViewChildren } from "../content/type";
import { Box, BoxProps } from "../content/box";

const logger = Logger({ prefix: "primitive", scope: "floating/popconfirm" });

/** Props for Popconfirm component */
export type PopconfirmProps = BoxProps & {
  /** Whether the popconfirm is visible */
  visible: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Called when user clicks confirm */
  onConfirm?: () => void;
  /** Called when user clicks cancel */
  onCancel?: () => void;
  /** Popconfirm title */
  title?: string;
  /** Popconfirm description */
  description?: string;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
};

/** Internal state for Popconfirm */
type PopconfirmState = {
  visible: boolean;
};

/**
 * Creates a Popconfirm component - a confirmation popover.
 *
 * @param props - Popconfirm props (visible, title, onConfirm, onCancel, etc.)
 * @param children - Trigger element
 * @returns A TimelessElement representing a confirmation popup
 */
export function Popconfirm(
  props: PopconfirmProps,
  children?: ViewChildren,
): TimelessElement<PopconfirmState> {
  const {
    visible,
    title,
    description,
    onConfirm,
    onCancel,
    ...rest
  } = props;

  let $elm: any = null;
  let box$ = Box(rest, { visible: false });

  const state = box$.state as typeof box$.state & PopconfirmState;
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
    t: "popconfirm",
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

export type Popconfirm = ReturnType<typeof Popconfirm>;
