import { ref, computed } from "@timeless/reactive";
import { ButtonCore } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
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

  return Show({
    when: computed(state, (d) => d.loading),
    ok() {
      return children || [];
    },
    onMounted() {
      return store.onStateChange(() => {
        state.as(store.state);
      });
    },
  });
}

export function Prefix(props: ViewProps, children?: ViewChildren) {
  return Fragment(props, children);
}

export function Content(props: ViewProps, children?: ViewChildren) {
  return Fragment(props, children);
}
