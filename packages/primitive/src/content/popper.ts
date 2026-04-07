import { isRef } from "@timeless/reactive";

import { MountedEvent } from "@/event";

import { isElement, MaybeSignal, TimelessElement, ViewChildren } from "./type";
import { Txt } from "./text";

export function Popper(
  props: {
    x: MaybeSignal<number>;
    y: MaybeSignal<number>;
    placed: MaybeSignal<boolean>;
    onMounted?: (event: MountedEvent) => void;
  },
  children?: ViewChildren,
) {
  const state: {
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
  } = {
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

  let $elm: any = null;
  const methods = {
    setup_children(children?: ViewChildren) {
      if (!children) {
        return;
      }
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // console.log("for children", child);
        (() => {
          if (typeof child === "function") {
            const r = child();
            state.children[i] = r;
            return;
          }
          if (isRef(child)) {
            // @ts-ignore
            state.children[i] = Txt(child);
            return;
          }
          if (typeof child === "string") {
            state.children[i] = Txt(String(child));
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
            $elm.setStyle({
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
          },
        });
      }
    },
  };

  methods.setup_children(children);
  methods.setup_value_subscribe();

  return {
    t: "popper",
    get $elm() {
      return $elm;
    },
    set $elm(value) {
      $elm = value;
    },
    children: state.children,
    props: state.props,
    get value() {
      return {
        placed: state.placed,
        x: state.x,
        y: state.y,
        zIndex: 99,
      };
    },
    onMounted(event: MountedEvent) {
      const { width, height } = $elm.getBoundingClientRect();
      state.width = width;
      state.height = height;

      if (props.onMounted) {
        props.onMounted(event);
      }
    },
  };
}
