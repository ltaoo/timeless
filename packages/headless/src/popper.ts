import { refobj, computed, cn } from "@timeless/reactive";
import { PopperCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "./view";
import { Arrow } from "./arrow";
import { Fragment } from "./fragment";

export function Root(
  props: ViewProps & { store: PopperCore },
  children: ViewChildren = [],
) {
  return Fragment(props, children);
}

export function Anchor(
  props: ViewProps & { store: PopperCore },
  children: ViewChildren,
) {
  const { store, ...rest } = props;
  console.log("[Popper Anchor] created");
  return View(
    {
      ...rest,
      onMounted($el) {
        console.log("[Popper Anchor] mounted");
        store.setReference({
          getRect() {
            const rect = $el.getBoundingClientRect();
            return rect;
          },
        });
        if (rest.onMounted) {
          rest.onMounted($el);
        }
      },
      onUnmounted() {
        console.log("[Popper Anchor] unmounted");
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    children,
  );
}

export function Content(
  props: ViewProps & { zIndex?: number; store: PopperCore },
  children: ViewChildren = [],
) {
  const { store, zIndex = 99, ...rest } = props;

  const state_ = refobj(store.state);

  const unsliten = [
    store.onStateChange((v) => {
      state_.as(v);
    }),
  ];

  return View(
    {
      ...rest,
      class: cn(["t1-popper", rest.class]),
      style: computed(state_, (t) => {
        const ss: Record<string, any> = {
          "z-index": zIndex,
          position: "fixed",
          left: 0,
          top: 0,
          opacity: t.isPlaced ? 100 : 0,
          transform: t.isPlaced
            ? `translate3d(${Math.round(t.x)}px, ${Math.round(t.y)}px, 0)`
            : "translate3d(0, 0, 0)",
        };
        return Object.keys(ss)
          .map((k) => {
            return `${k}: ${ss[k]}`;
          })
          .join("; ");
      }),
      onMounted($e: HTMLElement) {
        store.setFloating({
          $el: $e,
          getRect() {
            return $e.getBoundingClientRect();
          },
        });
      },
      onUnmounted() {
        // store.setFloating(null);
        // unlisten();
      },
    },
    children,
  );
}

export function Popper(
  props: ViewProps & {
    store: PopperCore;
    zIndex?: number;
  },
  children?: ViewChildren,
) {
  const { store, zIndex = 999, ...rest } = props;
  const state = refobj(store.state);

  const unlisten = store.onStateChange((v) => {
    state.as(v);
  });

  return View(
    {
      ...rest,
      class: cn(["t-popper", rest.class]),
      style: computed(state, (t) => {
        // console.log("[]popper - on stateChange callback", t.isPlaced);
        const ss: Record<string, any> = {
          "z-index": zIndex,
          position: "fixed",
          left: 0,
          top: 0,
          opacity: t.isPlaced ? 1 : 0,
          transform: t.isPlaced
            ? `translate3d(${Math.round(t.x)}px, ${Math.round(t.y)}px, 0)`
            : "translate3d(0, 0, 0)",
        };
        return Object.keys(ss)
          .map((k) => {
            return `${k}: ${ss[k]}`;
          })
          .join("; ");
      }),
      onMounted($el: HTMLElement) {
        store.setFloating({
          $el,
          getRect() {
            return $el.getBoundingClientRect();
          },
        });
      },
      onUnmounted() {
        // store.setFloating(null);
        // unlisten();
      },
    },
    children,
  );
}

export { Arrow };
