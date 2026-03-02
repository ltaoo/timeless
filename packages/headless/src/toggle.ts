import { ref, computed } from "@timeless/reactive";
import { ToggleCore } from "@timeless/ui";

import { tp, merge } from "./theme.js";
import { View, ViewProps } from "./view.js";

export function Toggle(
  props: ViewProps & {
    store: ToggleCore;
    disabled?: boolean;
    theme?: any;
  },
) {
  const { store, disabled, theme: t, class: cls, style: st } = props;

  const state = ref(store.state);
  const events: any[] = [];
  if (store.onStateChange)
    events.push(
      store.onStateChange(() => {
        state.as(store.state);
      }),
    );

  return View(
    {
      type: "button",
      class: computed(state, (d) => {
        return merge(
          tp(t?.root, { on: d.checked || d.value, disabled: d.disabled }),
          cls,
          st,
        ).class;
      }),
      // style: computed(state, (d) => {
      //   return merge(
      //     tp(t?.root, { on: isOn(d), disabled: d.disabled }),
      //     cn,
      //     st,
      //   ).style;
      // }),
      onClick() {
        store.toggle();
      },
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
        if (props.onUnmounted) props.onUnmounted();
      },
    },
    [
      View({
        type: "span",
        class: computed(state, (d) => {
          return merge(tp(t?.thumb, { on: d.checked || d.value })).class || "";
        }),
        style: computed(state, (d) => {
          return merge(tp(t?.thumb, { on: d.checked || d.value })).style || "";
        }),
      }),
    ],
  );
}
