import { cn } from "@timeless/reactive";

import { tp, merge } from "./theme";
import { ViewProps } from "./view";
import { InputCore } from "@timeless/ui";

export function Textarea(
  props: ViewProps & {
    store: InputCore<any>;
    theme?: any;
  },
) {
  const {
    store,
    style: st,
    class: cls,
    dataset = {},
    theme: t,
    ...rest
  } = props;
  const $elm = document.createElement("textarea");

  // Object.keys(rest).forEach((k) => {
  //   if (typeof rest[k] === "function") {
  //     return;
  //   }
  //   $elm.setAttribute(k, rest[k]);
  // });
  Object.keys(dataset).forEach((k) => {
    $elm.setAttribute(`data-${k}`, dataset[k]);
  });

  const m = merge(tp(t?.root), cls, st);
  const class$: any = cn([m.class || ""]);
  class$._subscribe({
    onChange(v: any) {
      $elm.className = v.join(" ");
    },
  });
  $elm.className = class$.toString();
  if (m.style) $elm.style.cssText = m.style;

  const events: any[] = [];
  if (store) {
    if (store.value !== undefined) $elm.value = store.value;
    $elm.addEventListener("input", (e) => {
      if (e.target) {
        store.setValue((e.target as any).value);
      }
    });
    const unsub = store.onStateChange
      ? store.onStateChange(() => {
          if (store.value !== undefined && $elm.value !== String(store.value))
            $elm.value = store.value;
        })
      : null;
    if (unsub) events.push(unsub);
  }

  return {
    t: "view",
    $elm,
    render() {
      return $elm;
    },
    onMounted() {
      if (props.onMounted) props.onMounted($elm);
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) props.beforeUnmounted();
    },
    onUnmounted() {
      for (const fn of events) if (typeof fn === "function") fn();
      if (props.onUnmounted) props.onUnmounted();
    },
  };
}
