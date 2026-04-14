import { ref, computed, Ref, isRef } from "@timeless/timeless";
import { View, ViewProps, ViewChildren, isStyleRef } from "@timeless/timeless";
import { ProgressCore } from "@timeless/ui-vm";

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

  const extraStyle =
    rest.style &&
    typeof rest.style === "object" &&
    !isRef(rest.style) &&
    !isStyleRef(rest.style)
      ? rest.style
      : {};

  if (store) {
    const state = ref(store.state);
    return View(
      {
        ...rest,
        style: {
          ...extraStyle,
          width: computed(state, (d) => {
            const v = d.value ?? 0;
            const m = d.max ?? 100;
            return `${Math.min(Math.max((v / m) * 100, 0), 100)}%`;
          }),
        },
      },
      children,
    );
  }

  return View(
    {
      ...rest,
      style: {
        ...extraStyle,
        width: computed(value, (d) => {
          const v = d;
          return `${Math.min(Math.max((v / max) * 100, 0), 100)}%`;
        }),
      },
    },
    children,
  );
}
