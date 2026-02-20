import { tp, merge } from "./theme.js";
import { View } from "../ui/view.js";
import { Txt } from "../ui/text.js";
import { For } from "../ui/for.js";
import { Show } from "../ui/show.js";
import { Portal } from "../ui/portal.js";
import { Presence } from "../ui/presence.js";
import { ref, computed } from "../ui/core.js";

export function Toast(props) {
  const { store, theme: t, class: cn, style: st } = props;
  const state = ref(store.state);
  const events = [];
  events.push(store.onStateChange(() => { state.value = store.state; }));
  const texts = computed({ state }, (d) => d.state.texts || []);

  return Portal({
    onUnmounted() { for (const fn of events) if (typeof fn === "function") fn(); },
  }, [
    Presence({ store: store.present }, [
      Show({ when: computed({ state }, (d) => !!d.state.mask) }, [
        View({ ...merge(tp(t?.mask)) }),
      ]),
      View({
        class: computed({ state }, (d) => merge(tp(t?.body, { enter: d.state.enter, exit: d.state.exit }), cn, st).class || ""),
        style: computed({ state }, (d) => merge(tp(t?.body, { enter: d.state.enter, exit: d.state.exit }), cn, st).style || ""),
      }, [
        Show({ when: computed({ state }, (d) => d.state.icon === "loading") }, [
          View({ ...merge(tp(t?.spinner)) }),
        ]),
        For({
          each: texts,
          render(text) {
            return View({ ...merge(tp(t?.text)) }, [Txt(text)]);
          },
        }),
      ]),
    ]),
  ]);
}
