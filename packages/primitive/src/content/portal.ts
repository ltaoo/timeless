/**
 * Portal - A component that renders children outside the current DOM hierarchy.
 *
 * Portal renders its children at a different place in the DOM tree,
 * typically at the document body. This is useful for:
 * - Modal dialogs
 * - Tooltips
 * - Dropdown menus
 * - Any content that should escape parent overflow
 *
 * The children are still part of the component tree for lifecycle purposes.
 *
 * @example
 * ```tsx
 * <Portal>
 *   <Box style={{ position: 'fixed' }}>
 *     <Text>Modal Content</Text>
 *   </Box>
 * </Portal>
 * ```
 */
import { isRef } from "@timeless/reactive";

import {
  TimelessElement,
  ViewChildren,
  isElement,
  resolve_children,
} from "@/content/type";
import { Text } from "@/content/text";
import { MountedEvent } from "@/event";
import { Logger } from "@/util/logger";

/** Props for Portal component */
type PortalProps = {
  onMounted?: (e: MountedEvent) => void;
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};

/** Internal state for Portal */
type PortalState = {
  children: (TimelessElement | null)[];
};

/** Logger for debugging portal operations */
const logger = Logger({ prefix: "primitive", scope: "content/portal" });

/**
 * Creates a Portal that renders children at document body.
 *
 * @param props - Portal lifecycle props
 * @param children - Content to render in portal
 * @returns A TimelessElement representing a portal
 */
export function Portal(props: PortalProps, children?: ViewChildren) {
  let $elm: any = null;
  const state: PortalState = {
    children: [],
  };

  const methods = {
    build_children(children?: ViewChildren) {
      const resolved = resolve_children(children);
      if (!resolved) {
        return;
      }
      for (let i = 0; i < resolved.length; i++) {
        const child = resolved[i];
        // console.log("for children", child);
        (() => {
          // if (typeof child === "function") {
          //   const r = child();
          //   state.children[i] = r;
          //   return;
          // }
          if (isElement(child)) {
            state.children[i] = child;
            return;
          }
          if (isRef(child)) {
            state.children[i] = Text(child);
            return;
          }
          if (child) {
            state.children[i] = Text(String(child));
            return;
          }
          state.children[i] = null;
        })();
      }
    },
  };

  methods.build_children(children);

  return {
    t: "portal",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    state,
    children: state.children,
    onMounted(event: MountedEvent) {
      logger.info("onMounted", state.children.length);
      if (props.onMounted) {
        props.onMounted({ target: event.target });
      }
      for (const child of state.children) {
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      for (const child of state.children) {
        if (isElement(child) && child.onUnmounted) {
          child.onUnmounted();
        }
      }
    },
  };
}
