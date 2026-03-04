import { ref, computed } from "@timeless/reactive";
import { ToggleCore } from "@timeless/ui";

import { tp, merge } from "./theme.js";
import { View, ViewProps } from "./view.js";

export function Toggle(
  props: ViewProps & {
    store: ToggleCore;
  },
) {
  const { store, class: cls, style: st } = props;

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
      ...props,
      type: "button",
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
      }),
    ],
  );
}
