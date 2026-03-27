import { ref, computed, isRef, Ref } from "@timeless/reactive";
import { ProgressCore } from "@timeless/ui";

import { View, ViewProps, ViewChildren } from "../primitive/view";

export function Root(
  props: ViewProps & {
    store?: ProgressCore;
    value?: Ref<number> | number;
    max?: number;
  },
  children?: ViewChildren,
) {
  const { store, value, max = 100, ...rest } = props;

  if (store) {
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
        ...rest,
        // role: "progressbar",
        // "aria-valuemin": 0,
        // "aria-valuemax": computed(state, (d) => d.max ?? 100),
        // "aria-valuenow": computed(state, (d) => d.value ?? 0),
        onUnmounted() {
          for (const fn of events) if (typeof fn === "function") fn();
          if (rest.onUnmounted) rest.onUnmounted();
        },
      },
      children,
    );
  }

  return View(
    {
      ...rest,
      // role: "progressbar",
      // "aria-valuemin": 0,
      // "aria-valuemax": max,
      // "aria-valuenow": isRef(value) ? computed(value, (v) => v) : value,
    },
    children,
  );
}

export function Indicator(
  props: ViewProps & {
    store?: ProgressCore;
    value: Ref<number>;
    max?: number;
  },
  children?: ViewChildren,
) {
  const { store, value, max = 100, ...rest } = props;

  if (store) {
    const state = ref(store.state);
    return View(
      {
        ...rest,
        style: computed(state, (d) => {
          const v = d.value ?? 0;
          const m = d.max ?? 100;
          const baseStyle = rest.style || "";
          return `${baseStyle}width:${Math.min(Math.max((v / m) * 100, 0), 100)}%`;
        }),
      },
      children,
    );
  }

  return View(
    {
      ...rest,
      style: computed(value, (d) => {
        const v = d;
        const baseStyle = rest.style || "";
        return `${baseStyle}width:${Math.min(Math.max((v / max) * 100, 0), 100)}%`;
      }),
    },
    children,
  );
}
