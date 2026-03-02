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
  return View(
    {
      ...rest,
      onMounted($el) {
        store.setReference({
          getRect() {
            const rect = $el.getBoundingClientRect();
            return rect;
          },
        });
      },
    },
    children,
  );
}

export function Content(
  props: ViewProps & { zIndex?: number; store: PopperCore },
  children: ViewChildren,
) {
  const { store, zIndex = 99, ...rest } = props;
  const state = refobj(store.state);

  const unlisten = store.onStateChange(() => {
    state.as(store.state);
  });

  return View(
    {
      ...rest,
      class: cn(["popper z-[999]", rest.class]),
      style: computed(state, (draft) => {
        const ss: Record<string, any> = {
          "z-index": zIndex,
          position: "fixed",
          left: 0,
          top: 0,
          opacity: draft.isPlaced ? 100 : 0,
          transform: draft.isPlaced
            ? `translate3d(${Math.round(draft.x)}px, ${Math.round(draft.y)}px, 0)`
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
        store.setFloating(null);
        unlisten();
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

  const unlisten = store.onStateChange(() => {
    state.as(store.state);
  });

  return View(
    {
      ...rest,
      class: cn(["popper z-[999]", rest.class]),
      style: computed(state, (draft) => {
        const ss: Record<string, any> = {
          "z-index": zIndex,
          position: "fixed",
          left: 0,
          top: 0,
          opacity: draft.isPlaced ? 1 : 0,
          transform: draft.isPlaced
            ? `translate3d(${Math.round(draft.x)}px, ${Math.round(draft.y)}px, 0)`
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
        store.setFloating(null);
        unlisten();
      },
    },
    children,
  );
}

export { Arrow };
