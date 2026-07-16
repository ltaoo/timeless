/**
 * Tooltip - A hover-triggered floating tooltip component.
 *
 * Tooltip displays a brief hint when hovering over a trigger element.
 * It supports:
 * - Positioned relative to trigger via side/align
 * - Reactive visible state
 * - Lightweight popup without overlay
 *
 * @example
 * ```tsx
 * <Tooltip
 *   visible={isOpen}
 *   content="Help text"
 *   side="top"
 *   align="center"
 * >
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/reactive";
import { Logger } from "@/util/logger";

import { destroyElement, isElement, TimelessElement, ViewChildren } from "../content/type";
import { Box, BoxProps } from "../content/box";

const logger = Logger({ prefix: "primitive", scope: "floating/tooltip" });

/** Side for tooltip placement */
export type TooltipSide = "top" | "bottom" | "left" | "right";

/** Alignment along the placement axis */
export type TooltipAlign = "start" | "center" | "end";

/** Props for Tooltip component */
export type TooltipProps = BoxProps & {
  /** Whether the tooltip is visible */
  visible: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Tooltip text content (string shorthand) */
  content?: string | ViewChildren;
  /** Preferred side relative to the trigger */
  side?: TooltipSide;
  /** Alignment along the placement side */
  align?: TooltipAlign;
};

/** Internal state for Tooltip */
type TooltipState = {
  visible: boolean;
  side: TooltipSide;
  align: TooltipAlign;
};

/**
 * Creates a Tooltip component - a lightweight floating hint.
 *
 * @param props - Tooltip props (visible, content, side, align, etc.)
 * @param children - Trigger element
 * @returns A TimelessElement representing a tooltip
 */
export function Tooltip(
  props: TooltipProps,
  children?: ViewChildren,
): TimelessElement<TooltipState> {
  const {
    visible,
    content,
    side = "top",
    align = "center",
    ...rest
  } = props;

  let $elm: any = null;
  let box$ = Box(rest, { visible: false, side, align });

  const state = box$.state as typeof box$.state & TooltipState;
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

  // Build children: trigger element first, then tooltip content
  box$.methods.build_children(children);

  return {
    t: "tooltip",
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

export type Tooltip = ReturnType<typeof Tooltip>;
