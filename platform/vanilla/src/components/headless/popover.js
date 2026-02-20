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
  const visible = computed({ state }, (d) => d.state.visible || d.state.enter || d.state.exit);
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
          class: computed({ state }, (d) => {
            const s = d.state;
            return merge(tp(t?.content, { enter: s.enter, exit: s.exit }), cn, st).class || "";
          }),
          style: computed({ state }, (d) => {
            const s = d.state;
            const tr = merge(tp(t?.content, { enter: s.enter, exit: s.exit }), cn, st);
            const base = tr.style || "";
            const visibleFlag = s.visible || s.enter;
            return [
              base,
              "transition:opacity 160ms ease-out,transform 160ms ease-out;",
              visibleFlag
                ? "opacity:1;transform:translate3d(0,0,0);"
                : "opacity:0;transform:translate3d(0,-4px,0);",
            ].join("");
          }),
        }, children || []),
      ]),
    ]),
  ]);
}
