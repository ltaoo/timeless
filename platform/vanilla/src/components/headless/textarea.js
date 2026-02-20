import { tp, merge } from "./theme.js";
import { classnames } from "../ui/core.js";

export function Textarea(props) {
  const { store, style: st, class: cn, dataset, theme: t, ...rest } = props;
  const $elm = document.createElement("textarea");

  Object.keys(rest).forEach((k) => {
    if (typeof rest[k] === "function") return;
    $elm.setAttribute(k, rest[k]);
  });
  Object.keys(dataset || {}).forEach((k) => {
    $elm.setAttribute(`data-${k}`, dataset[k]);
  });

  const m = merge(tp(t?.root), cn, st);
  const class$ = classnames(m.class || "");
  class$.listen({ onChange(v) { $elm.className = v.join(" "); } });
  $elm.className = class$.toString();
  if (m.style) $elm.style.cssText = m.style;

  const events = [];
  if (store) {
    if (store.value !== undefined) $elm.value = store.value;
    $elm.addEventListener("input", (e) => { store.setValue(e.target.value); });
    const unsub = store.onStateChange ? store.onStateChange(() => {
      if (store.value !== undefined && $elm.value !== String(store.value)) $elm.value = store.value;
    }) : null;
    if (unsub) events.push(unsub);
  }

  return {
    t: "view", $elm,
    render() { return $elm; },
    onMounted() { if (props.onMounted) props.onMounted($elm); },
    beforeUnmounted() { if (props.beforeUnmounted) props.beforeUnmounted(); },
    onUnmounted() {
      for (const fn of events) if (typeof fn === "function") fn();
      if (props.onUnmounted) props.onUnmounted();
    },
  };
}
