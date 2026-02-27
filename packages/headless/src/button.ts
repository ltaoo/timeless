import { ref, computed } from "@timeless/reactive";
import { ui } from "@timeless/domains";

import { tp, merge } from "./theme.js";
import { View, ViewProps } from "./view.js";
import { Show } from "./show.js";

export function Button(
  props: ViewProps & {
    store: ui.ButtonCore;
    theme?: any;
    variant?: "default";
    size?: "default" | "large" | "small";
  },
  children?: any,
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
    const m = (d: any) =>
      merge(
        tp(t?.root, {
          variant,
          size,
          loading: d.state.loading,
          disabled: d.state.disabled,
        }),
        cn,
        st,
      );

    return View(
      {
        type: "button",
        ...rest,
        class: computed({ state }, (d: any) => m(d).class),
        // style: computed({ state }, (d: any) => m(d).style),
        onClick() {
          store.click();
        },
        onUnmounted() {
          for (const fn of events) if (typeof fn === "function") fn();
          if (rest.onUnmounted) rest.onUnmounted();
        },
      },
      [
        Show({ when: computed({ state }, (d: any) => d.state.loading) }, [
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
