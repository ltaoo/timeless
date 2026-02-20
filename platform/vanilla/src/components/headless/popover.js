import { tp, merge } from "./theme.js";
import { View } from "../ui/view.js";
import { Show } from "../ui/show.js";
import { Portal } from "../ui/portal.js";
import { ref, computed } from "../ui/core.js";

export function Popover(props, children) {
  const { store, theme: t, class: cn, style: st, ...rest } = props;
  const state = ref(store.state);
  const events = [];
  events.push(store.onStateChange(() => { state.value = store.state; }));
  const visible = computed({ state }, (d) => d.state.visible || d.state.enter);
  const layer = store.layer;
  let handlePointerDown;

  return Portal({
    onUnmounted() {
      for (const fn of events) if (typeof fn === "function") fn();
      if (rest.onUnmounted) rest.onUnmounted();
    },
  }, [
    Show({ when: visible }, [
      View({
        ...merge(tp(t?.wrapper)),
        style: computed({ state }, (d) => {
          const s = d.state;
          const base = merge(tp(t?.wrapper)).style || "";
          return [
            base,
            `opacity:${s.isPlaced ? 1 : 0};`,
            s.isPlaced
              ? `transform:translate3d(${Math.round(s.x)}px,${Math.round(s.y)}px,0);`
              : "transform:translate3d(0,-200%,0);",
          ].join("");
        }),
        onMounted($e) {
          store.popper.setFloating({ $el: $e, getRect() { return $e.getBoundingClientRect(); } });
          if (layer) {
            handlePointerDown = () => {
              layer.handlePointerDownOnTop();
            };
            document.addEventListener("pointerdown", handlePointerDown);
            $e.addEventListener("pointerdown", () => {
              layer.pointerDown();
            });
          }
        },
        onUnmounted() {
          store.popper.setFloating(null);
          if (layer && handlePointerDown) {
            document.removeEventListener("pointerdown", handlePointerDown);
            handlePointerDown = null;
          }
        },
      }, [
        View({
          class: computed({ state }, (d) => merge(tp(t?.content, { enter: d.state.enter, exit: d.state.exit }), cn, st).class || ""),
          style: computed({ state }, (d) => merge(tp(t?.content, { enter: d.state.enter, exit: d.state.exit }), cn, st).style || ""),
        }, children || []),
      ]),
    ]),
  ]);
}
