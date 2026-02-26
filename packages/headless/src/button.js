import { tp, merge } from "./theme.js";
import { View } from "./view.js";
import { Show } from "./show.js";
import { ref, computed } from "./core.js";

export function Button(props, children) {
  const { store, variant = "default", size = "default", theme: t, class: cn, style: st, ...rest } = props;

  if (store) {
    const state = ref(store.state);
    const events = [];
    events.push(store.onStateChange(() => { state.value = store.state; }));
    const m = (d) => merge(tp(t?.root, { variant, size, loading: d.state.loading, disabled: d.state.disabled }), cn, st);

    return View({
      type: "button",
      ...rest,
      class: computed({ state }, (d) => m(d).class),
      style: computed({ state }, (d) => m(d).style),
      onClick() { store.click(); },
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
        if (rest.onUnmounted) rest.onUnmounted();
      },
    }, [
      Show({ when: computed({ state }, (d) => d.state.loading) }, [
        View({ ...merge(tp(t?.spinner)) }),
      ]),
      ...children,
    ]);
  }

  return View({
    type: "button",
    ...rest,
    ...merge(tp(t?.root, { variant, size }), cn, st),
  }, children);
}
