import { ref, computed } from "@timeless/reactive";
import { ButtonCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "@/content/view";
import { Fragment } from "@/content/fragment";
import { Show } from "@/reactive/show";

export function Root(
  props: ViewProps & { store: ButtonCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      as: "button",
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
  return Fragment(props, children);
}

export function Content(props: ViewProps, children?: ViewChildren) {
  return Fragment(props, children);
}
