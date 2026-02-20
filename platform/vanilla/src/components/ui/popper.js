import { ref, computed } from "./core.js";
import { View } from "./view.js";
import { Portal } from "./portal.js";
import { Presence } from "./presence.js";

export function Popper(props, children) {
  const state = ref(props.store.state);
  let unsubscribe;

  const content$ = View(
    {
      class: "portal z-[999]",
      style: computed({ state }, (draft) => {
        const ss = {
          "z-index": 999,
          position: "fixed",
          left: 0,
          top: 0,
          opacity: draft.state.isPlaced ? 100 : 0,
          transform: draft.state.isPlaced
            ? `translate3d(${Math.round(draft.state.x)}px, ${Math.round(draft.state.y)}px, 0)`
            : "translate3d(0, -200%, 0)",
        };
        return Object.keys(ss)
          .map((k) => {
            return `${k}: ${ss[k]}`;
          })
          .join("; ");
      }),
      onMounted($e) {
        props.store.setFloating({
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
      },
      onUnmounted() {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
        props.store.setFloating(null);
      },
    },
    children,
  );
  unsubscribe = props.store.onStateChange(() => {
    // console.log(
    //   "[baseui]Popover props.store.onStateChange",
    //   props.store.state.isPlaced,
    //   props.store.state.visible,
    // );
    state.value = props.store.state;
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
