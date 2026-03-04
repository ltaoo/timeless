import { ref, computed } from "@timeless/reactive";
import { CheckboxCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "./view";
import { Show } from "./show";

export function Root(
  props: ViewProps & { store: CheckboxCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onClick(e) {
        if (rest.onClick) rest.onClick(e);
        store.toggle();
      },
      onUnmounted() {
        if (rest.onUnmounted) rest.onUnmounted();
      },
    },
    children,
  );
}

export function Box(
  props: ViewProps & { store: CheckboxCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state = ref(store.state);
  const events: any[] = [];

  return View(
    {
      ...rest,
      // "data-checked": computed(state, (d) => (d.checked ? "" : undefined)),
      // "data-disabled": computed(state, (d) => (d.disabled ? "" : undefined)),
      onMounted() {
        events.push(
          store.onStateChange(() => {
            state.as(store.state);
          }),
        );
        if (store.onChange) {
          events.push(
            store.onChange(() => {
              state.as(store.state);
            }),
          );
        }
      },
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
        if (rest.onUnmounted) rest.onUnmounted();
      },
    },
    children,
  );
}

export function Indicator(
  props: ViewProps & { store: CheckboxCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state_ = ref(store.state);
  const events: any[] = [];

  return Show(
    {
      when: computed(state_, (d) => d.checked),
      onMounted() {
        events.push(
          store.onStateChange(() => {
            state_.as(store.state);
          }),
        );
        if (store.onChange) {
          events.push(
            store.onChange(() => {
              state_.as(store.state);
            }),
          );
        }
      },
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
      },
    },
    children,
  );
}

export function Label(props: ViewProps, children?: ViewChildren) {
  return View(props, children);
}
