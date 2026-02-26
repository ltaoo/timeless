import { tp, merge } from "./theme.js";
import { View } from "./view.js";
import { ref, computed } from "./core.js";

export function Checkbox(props) {
  const { store, theme: t, class: cn, style: st, ...rest } = props;
  const state = ref(store.state);
  const events = [];
  const unsub = store.onStateChange ? store.onStateChange(() => { state.value = store.state; }) : null;
  if (unsub) events.push(unsub);
  if (store.onChange) events.push(store.onChange(() => { state.value = store.state; }));

  const m = (d) => merge(tp(t?.root), cn, st);

  return View({
    ...rest,
    ...m(),
    onClick() { store.toggle(); },
    onUnmounted() {
      for (const fn of events) if (typeof fn === "function") fn();
      if (rest.onUnmounted) rest.onUnmounted();
    },
  }, [
    View({
      class: computed({ state }, (d) => merge(tp(t?.box, { checked: d.state.checked, disabled: d.state.disabled })).class || ""),
      style: computed({ state }, (d) => merge(tp(t?.box, { checked: d.state.checked, disabled: d.state.disabled })).style || ""),
    }, [
      View({
        type: "span",
        class: computed({ state }, (d) => merge(tp(t?.check, { checked: d.state.checked })).class || ""),
        style: computed({ state }, (d) => merge(tp(t?.check, { checked: d.state.checked })).style || ""),
      }, [{ t: "text", $elm: document.createTextNode("\u2713"), render() { return this.$elm; }, onMounted() {}, beforeUnmounted() {}, onUnmounted() {} }]),
    ]),
  ]);
}
