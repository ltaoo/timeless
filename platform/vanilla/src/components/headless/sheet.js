import { tp, merge } from "./theme.js";
import { View } from "../ui/view.js";
import { Txt } from "../ui/text.js";
import { Portal } from "../ui/portal.js";
import { Presence } from "../ui/presence.js";
import { ref, computed } from "../ui/core.js";

export function Sheet(props, children) {
  const { store, side = "right", theme: t, class: cn, style: st, ...rest } = props;
  const state = ref(store.state);
  const events = [];
  events.push(store.onStateChange(() => { state.value = store.state; }));

  return Portal({
    onUnmounted() {
      for (const fn of events) if (typeof fn === "function") fn();
      if (rest.onUnmounted) rest.onUnmounted();
    },
  }, [
    Presence({ store: store.presence || store }, [
      View({
        class: computed({ state }, (d) => merge(tp(t?.overlay, { enter: d.state.enter, exit: d.state.exit })).class || ""),
        style: computed({ state }, (d) => merge(tp(t?.overlay, { enter: d.state.enter, exit: d.state.exit })).style || ""),
        onClick() { store.hide(); },
      }),
      View({
        class: computed({ state }, (d) => merge(tp(t?.content, { side, visible: d.state.visible, enter: d.state.enter }), cn, st).class || ""),
        style: computed({ state }, (d) => merge(tp(t?.content, { side, visible: d.state.visible, enter: d.state.enter }), cn, st).style || ""),
      }, [
        View({
          ...merge(tp(t?.closeBtn)),
          onClick() { store.hide(); },
        }, [Txt("\u2715")]),
        ...(children || []),
      ]),
    ]),
  ]);
}
