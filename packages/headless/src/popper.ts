import { ref, computed } from "@timeless/reactive";
import { View } from "./view.js";
import { Portal } from "./portal.js";
import { Presence } from "./presence.js";

export function Popper(props: any, children?: any) {
  const { store, zIndex = 999, ...rest } = props;
  const state = ref(store.state);
  let unsubscribe: any;

  const content$ = View(
    {
      ...rest,
      class: "portal z-[999]",
      style: computed({ state }, (draft: any) => {
        const ss: any = {
          "z-index": zIndex,
          position: "fixed",
          left: 0,
          top: 0,
          opacity: draft.state.isPlaced ? 100 : 0,
          transform: draft.state.isPlaced
            ? `translate3d(${Math.round(draft.state.x)}px, ${Math.round(draft.state.y)}px, 0)`
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
            console.log(
              "[COMPONENT]PopperContent - getRect of floating",
              $e,
              rect,
            );
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
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
        store.setFloating(null);
      },
    },
    children,
  );
  unsubscribe = store.onStateChange(() => {
    // console.log(
    //   "[baseui]Popover props.store.onStateChange",
    //   store.state.isPlaced,
    //   store.state.visible,
    // );
    state.as(store.state);
  });

  // return Presence(
  //   {
  //     store: props.store.present,
  //     animation: {
  //       in: "fade-in",
  //       out: "fade-out",
  //     },
  //   },
  //   [content$],
  // );
  return content$;
}
