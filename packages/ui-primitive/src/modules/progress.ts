import { ref, computed, Ref, isRef } from "../core";
import { View, ViewProps, ViewChildren, isStyleRef } from "../core";
import { ProgressCore } from "@timeless/inner-vm";

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
        attributes: {
          n: "progress",
          ...rest.attributes,
          role: "progressbar",
          "aria-valuemin": "0",
          "aria-valuemax": computed(state, (value) => value.max ?? 100),
          "aria-valuenow": computed(state, (value) => value.value),
        },
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
      attributes: {
        n: "progress",
        ...rest.attributes,
        role: "progressbar",
        "aria-valuemin": "0",
        "aria-valuemax": max,
        "aria-valuenow": isRef(value)
          ? computed(value, (value) => value)
          : value,
      },
    },
    children,
  );
}

export function Indicator(
  props: ViewProps & {
    store?: ProgressCore;
    value?: Ref<number> | number;
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
        onMounted(event) {
          state.as(store.state);
          const unsubscribe = store.onStateChange((value) => state.as(value));
          const cleanup = rest.onMounted?.(event);
          return () => {
            unsubscribe();
            cleanup?.();
          };
        },
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

  const valueRef = isRef(value) ? value : ref(value ?? 0);
  return View(
    {
      ...rest,
      style: {
        ...extraStyle,
        width: computed(valueRef, (d) => {
          const v = d;
          return `${Math.min(Math.max((v / max) * 100, 0), 100)}%`;
        }),
      },
    },
    children,
  );
}
