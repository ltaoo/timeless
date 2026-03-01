import { ref, refobj, computed, cn } from "@timeless/reactive";
import { PopperCore } from "@timeless/ui/popper";

import { View, ViewChildren, ViewProps } from "./view";

export function Popper(
  props: ViewProps & {
    store: PopperCore;
    zIndex?: number;
  },
  children?: ViewChildren,
) {
  const { store, zIndex = 999, ...rest } = props;
  const state = refobj(store.state);

  // console.log('before store.onState change')
  const unsubscribe = store.onStateChange(() => {
    // console.log(
    //   "[baseui]Popover props.store.onStateChange",
    //   store.state.isPlaced,
    // );
    state.as(store.state);
  });

  return View(
    {
      ...rest,
      class: cn(["popper z-[999]", rest.class]),
      style: computed(state, (draft) => {
        // console.log("[DEBUG-POPPER] popper on state changed", draft);
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
            const rect = $e.getBoundingClientRect();
            // console.log(
            //   "[COMPONENT]PopperContent - getRect of floating",
            //   $e,
            //   rect,
            // );
            return rect;
          },
        });
        // if (typeof store.place2 === "function") {
        //   const rect = $e.getBoundingClientRect();
        //   store.place2({
        //     x: rect.x,
        //     y: rect.y,
        //     width: rect.width,
        //     height: rect.height,
        //   });
        // }
      },
      onUnmounted() {
        // if (typeof unsubscribe === "function") {
        //   unsubscribe();
        // }
        store.setFloating(null);
      },
    },
    children,
  );
}
