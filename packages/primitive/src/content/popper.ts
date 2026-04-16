/**
 * Popper - A positioned floating element component.
 *
 * Popper renders content at a specific screen position (x, y).
 * It's commonly used for:
 * - Tooltips
 * - Dropdown menus
 * - Floating action buttons
 * - Modal dialogs
 *
 * Supports reactive x, y, and placed props for dynamic positioning.
 *
 * @example
 * ```tsx
 * <Popper
 *   x={popperX}
 *   y={popperY}
 *   placed={isOpen}
 * >
 *   <Box>Popover Content</Box>
 * </Popper>
 * ```
 */
import { DerivedRef, isRef, Ref, refobj } from "@timeless/reactive";

import { styleNames } from "@/style";
import { MountedEvent } from "@/event";

import { Text } from "./text";
import { View, ViewProps } from "./view";
import { isElement, TimelessElement, ViewChildren } from "./type";

/** Props for Popper component */
type PopperProps = ViewProps & {
  /** X position in pixels */
  x: number | DerivedRef<number> | Ref<number>;
  /** Y position in pixels */
  y: number | DerivedRef<number> | Ref<number>;
  /** Whether the popper is visible */
  placed: boolean | DerivedRef<boolean> | Ref<boolean>;
  onMounted?: (event: MountedEvent) => void;
};

/** Internal state for Popper */
type PopperState = {
  children: TimelessElement[];
  width: number;
  height: number;
  placed: boolean;
  x: number;
  y: number;
  props: {
    side: "top" | "bottom" | "left" | "right";
    placement: "start" | "end" | "middle";
    strategy: "absolute" | "fixed";
  };
};

/**
 * Creates a Popper component at a specific position.
 *
 * @param props - Position and placement props
 * @param children - Content to render
 * @returns A TimelessElement representing a positioned element
 */
export function Popper(props: PopperProps, children?: ViewChildren) {
  let $elm: any = null;
  const state: PopperState = {
    children: [],
    width: 0,
    height: 0,
    placed: false,
    props: {
      placement: "start",
      side: "top",
      strategy: "absolute",
    },
    x: 0,
    y: 0,
  };
  const style_ = refobj({});

  const methods = {
    setup_children(children?: ViewChildren) {
      if (!children) {
        return;
      }
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // console.log("for children", child);
        (() => {
          // if (typeof child === "function") {
          //   const r = child();
          //   state.children[i] = r;
          //   return;
          // }
          if (isRef(child)) {
            state.children[i] = Text(child);
            return;
          }
          if (typeof child === "string") {
            state.children[i] = Text(String(child));
            return;
          }
          if (isElement(child)) {
            state.children[i] = child;
            return;
          }
          // state.children[i] = null;
        })();
      }
    },
    setup_value_subscribe() {
      if (isRef(props.x)) {
        props.x.subscribe({
          onChange(v) {
            state.x = v as number;
            //     if ($elm) {
            //       $elm.setStyle({
            //         x: state.props.x,
            //       });
            //     }
          },
        });
      }
      if (isRef(props.y)) {
        props.y.subscribe({
          onChange(v) {
            state.y = v as number;
            //     if ($elm) {
            //       $elm.setStyle({
            //         y: state.props.y,
            //       });
            //     }
          },
        });
      }
      if (isRef(props.placed)) {
        props.placed.subscribe({
          onChange(v) {
            state.placed = v as boolean;
            style_.as({
              "z-index": 99,
              position: "fixed",
              left: 0,
              top: 0,
              opacity: state.placed ? 1 : 0,
              "pointer-event": state.placed ? "initial" : "none",
              transform: state.placed
                ? `translate3d(${Math.round(state.x)}px, ${Math.round(state.y)}px, 0)`
                : "translate3d(0, 0, 0)",
            });
            // $elm.setStyle({});
          },
        });
      }
    },
  };

  // methods.setup_children(children);
  methods.setup_value_subscribe();

  return View({ ...props, style: styleNames([props.style, style_]) }, children);
  // return {
  //   t: "popper",
  //   get $elm() {
  //     return $elm;
  //   },
  //   set $elm(value) {
  //     $elm = value;
  //   },
  //   children: state.children,
  //   state,
  //   props: state.props,
  //   get value() {
  //     return {
  //       placed: state.placed,
  //       x: state.x,
  //       y: state.y,
  //       zIndex: 99,
  //     };
  //   },
  //   onMounted(event: MountedEvent) {
  //     const { width, height } = $elm.getBoundingClientRect();
  //     state.width = width;
  //     state.height = height;

  //     if (props.onMounted) {
  //       props.onMounted(event);
  //     }

  //     for (const child of state.children) {
  //       if (isElement(child) && child.onMounted) {
  //         child.onMounted({ target: child.$elm });
  //       }
  //     }
  //   },
  // };
}
