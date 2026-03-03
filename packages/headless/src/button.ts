import { ref, computed } from "@timeless/reactive";
import { ButtonCore } from "@timeless/ui";

import { tp, merge } from "./theme";
import { View, ViewChildren, ViewProps } from "./view";
import { Show } from "./show";

export function Root(
  props: ViewProps & { store: ButtonCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      type: "button",
      onClick(e) {
        if (rest.onClick) rest.onClick(e);
        store.click();
      },
      onUnmounted() {
        if (rest.onUnmounted) rest.onUnmounted();
      },
    },
    children,
  );
}

export function Loading(
  props: ViewProps & { store: ButtonCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state = ref(store.state);
  const events: any[] = [];

  return Show(
    {
      when: computed(state, (d) => d.loading),
      onMounted() {
        events.push(
          store.onStateChange(() => {
            state.as(store.state);
          }),
        );
      },
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
      },
    },
    children,
  );
}

export function Prefix(props: ViewProps, children?: ViewChildren) {
  return View(props, children);
}

export function Content(props: ViewProps, children?: ViewChildren) {
  return View(props, children);
}
