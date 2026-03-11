import { cn } from "@timeless/reactive";

import { ViewProps } from "./view";
import { InputCore } from "@timeless/ui";

export function Textarea(
  props: ViewProps & {
    store: InputCore<any>;
    id?: string;
  },
) {
  const { store, style: st, class: cls, dataset = {}, id, ...rest } = props;
  const $elm = document.createElement("textarea");

  const events: any[] = [];

  return {
    t: "view",
    $elm,
    render() {
      if (id) {
        $elm.id = id;
      }

      Object.keys(dataset).forEach((k) => {
        $elm.setAttribute(`data-${k}`, dataset[k]);
      });

      const class$: any = cn([cls || ""]);
      class$._subscribe({
        onChange(v: any) {
          $elm.className = v.join(" ");
        },
      });
      $elm.className = class$.toString();
      if (st && typeof st === "string") {
        $elm.style.cssText = st;
      }

      if (store) {
        if (store.value !== undefined) $elm.value = store.value;
        $elm.addEventListener("input", (e) => {
          if (e.target) {
            store.setValue((e.target as any).value);
          }
        });
        const unsub = store.onStateChange
          ? store.onStateChange(() => {
              if (
                store.value !== undefined &&
                $elm.value !== String(store.value)
              )
                $elm.value = store.value;
            })
          : null;
        if (unsub) events.push(unsub);
      }

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
