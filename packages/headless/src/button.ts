import { ref, computed } from "@timeless/reactive";
import { ui } from "@timeless/domains";

import { tp, merge } from "./theme.js";
import { View, ViewChildren, ViewProps } from "./view.js";
import { Show } from "./show.js";

export function Button(
  props: ViewProps & {
    store: ui.ButtonCore;
    theme?: any;
    variant?: "default";
    size?: "default" | "large" | "small";
    disabled?: boolean;
    loading?: boolean;
  },
  children?: ViewChildren,
) {
  const {
    store,
    variant = "default",
    size = "default",
    theme: t,
    class: cn,
    style: st,
    ...rest
  } = props;

  if (store) {
    const state = ref(store.state);
    const events: any[] = [];
    events.push(
      store.onStateChange(() => {
        state.as(store.state);
      }),
    );
    const m = (d: Record<string, any>) =>
      merge(
        tp(t?.root, {
          variant,
          size,
          loading: d.loading,
          disabled: d.disabled,
        }),
        cn,
        st,
      );

    return View(
      {
        type: "button",
        ...rest,
        class: computed(state, (d) => m(d).class),
        // style: computed(state, (d) => m(d).style),
        onClick() {
          store.click();
        },
        onUnmounted() {
          for (const fn of events) if (typeof fn === "function") fn();
          if (rest.onUnmounted) rest.onUnmounted();
        },
      },
      [
        Show({ when: computed(state, (d) => d.loading) }, [
          View({ ...merge(tp(t?.spinner)) }),
        ]),
        ...(Array.isArray(children) ? children : [children]),
      ],
    );
  }

  return View(
    {
      type: "button",
      ...rest,
      ...merge(tp(t?.root, { variant, size }), cn, st),
    },
    children,
  );
}
