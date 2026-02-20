import { tp, merge } from "./theme.js";
import { View } from "../ui/view.js";
import { Txt } from "../ui/text.js";
import { Show } from "../ui/show.js";
import { Portal } from "../ui/portal.js";
import { Presence } from "../ui/presence.js";
import { ref, computed } from "../ui/core.js";

export function Dialog(props, children) {
  const { store, theme: t, class: cn, style: st, ...rest } = props;
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
        class: computed({ state }, (d) => merge(tp(t?.content, { enter: d.state.enter, exit: d.state.exit }), cn, st).class || ""),
        style: computed({ state }, (d) => merge(tp(t?.content, { enter: d.state.enter, exit: d.state.exit }), cn, st).style || ""),
      }, [
        Show({ when: computed({ state }, (d) => !!d.state.title) }, [
          View({ ...merge(tp(t?.titleWrap)) }, [
            View({ ...merge(tp(t?.title)) }, [
              Txt(computed({ state }, (d) => d.state.title || "")),
            ]),
          ]),
        ]),
        View({ ...merge(tp(t?.body)) }, children || []),
        View({
          ...merge(tp(t?.closeBtn)),
          onClick() { store.hide(); },
        }, [Txt("\u2715")]),
        Show({ when: computed({ state }, (d) => !!d.state.footer) }, [
          View({ ...merge(tp(t?.footer)) }, [
            View({
              type: "button",
              ...merge(tp(t?.cancelBtn)),
              onClick() { store.cancel(); },
            }, [Txt("\u53D6\u6D88")]),
            View({
              type: "button",
              ...merge(tp(t?.okBtn)),
              onClick() { store.ok(); },
            }, [Txt("\u786E\u8BA4")]),
          ]),
        ]),
      ]),
    ]),
  ]);
}
