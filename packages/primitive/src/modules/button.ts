import { ref, computed } from "@timeless/reactive";
import { ButtonCore } from "@timeless/ui";

import { ViewChildren } from "@/content/type";
import { Fragment, FragmentProps } from "@/content/fragment";
import { Show } from "@/reactive/show";
import { Button, ButtonProps } from "@/interaction/button";

export function Root(
  props: ButtonProps & { store: ButtonCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return Button(
    {
      ...rest,
      onClick(e) {
        if (rest.onClick) rest.onClick(e);
        store.click();
      },
    },
    children,
  );
}

export function Loading(props: { store: ButtonCore }, children?: ViewChildren) {
  const { store } = props;

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

export function Prefix(props: FragmentProps, children?: ViewChildren) {
  return Fragment(props, children);
}

export function Content(props: FragmentProps, children?: ViewChildren) {
  return Fragment(props, children);
}
